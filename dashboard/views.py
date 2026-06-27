import os
import json
import random
from decimal import Decimal
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib import messages
from django.db.models import Count, Sum, Q
from django.core.paginator import Paginator
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone

from products.models import Product, Category, Brand, SubBrand
from orders.models import Order, OrderItem

User = get_user_model()

# Helper checks for manager/admin access
def is_manager(user):
    return user.is_authenticated and (
        user.is_staff or 
        user.user_type == 'administrator' or
        getattr(user, 'is_product_manager', False) or 
        getattr(user, 'is_order_manager', False) or 
        getattr(user, 'is_sales_manager', False)
    )

def manager_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('admin_login')
        if is_manager(request.user):
            return view_func(request, *args, **kwargs)
        messages.error(request, "Access denied. Admin credentials required.")
        return redirect('home')
    return wrapper

# Settings Helper Functions
def load_global_settings():
    settings_file = os.path.join(settings.BASE_DIR, 'global_settings.json')
    if os.path.exists(settings_file):
        try:
            with open(settings_file, 'r') as f:
                data = json.load(f)
                # Ensure all required keys exist
                defaults = {
                    "shop_enabled": True,
                    "checkout_enabled": True,
                    "cart_enabled": True,
                    "website_logo": "/static/images/logo.png",
                    "admin_email": "admin@techno360.com",
                    "base_currency": "INR",
                    "maintenance_mode": False
                }
                for k, v in defaults.items():
                    if k not in data:
                        data[k] = v
                return data
        except Exception:
            pass
    return {
        "shop_enabled": True,
        "checkout_enabled": True,
        "cart_enabled": True,
        "website_logo": "/static/images/logo.png",
        "admin_email": "admin@techno360.com",
        "base_currency": "INR",
        "maintenance_mode": False
    }

def save_global_settings(data):
    settings_file = os.path.join(settings.BASE_DIR, 'global_settings.json')
    try:
        with open(settings_file, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

# Admin Login & Logout
def admin_login(request):
    if request.user.is_authenticated and is_manager(request.user):
        return redirect('admin_home')
        
    if request.method == 'POST':
        login_id = request.POST.get('username')
        password = request.POST.get('password')
        
        username = login_id
        if '@' in login_id:
            user_obj = User.objects.filter(email=login_id).first()
            if user_obj:
                username = user_obj.username
                
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if is_manager(user):
                login(request, user)
                messages.success(request, f"Welcome to the Admin Portal, {user.first_name or user.username}.")
                return redirect('admin_home')
            else:
                messages.error(request, "Access denied. Administrator privileges required.")
        else:
            messages.error(request, "Invalid administrator credentials.")
            
    return render(request, 'dashboard/login.html')

def admin_logout(request):
    logout(request)
    return redirect('admin_login')

# Dashboard Landing Page
@manager_required
def admin_home(request):
    global_settings = load_global_settings()
    
    # Handle quick toggles for shop and checkout
    if request.method == 'POST' and 'toggle_shop_checkout' in request.POST:
        shop_enabled = request.POST.get('shop_enabled') == 'on'
        checkout_enabled = request.POST.get('checkout_enabled') == 'on'
        global_settings['shop_enabled'] = shop_enabled
        global_settings['checkout_enabled'] = checkout_enabled
        save_global_settings(global_settings)
        messages.success(request, "Shop & Checkout status updated.")
        return redirect('admin_home')
        
    # KPIs
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    product_families_count = Category.objects.count()
    
    # Products table listing with search and pagination
    query = request.GET.get('search', '').strip()
    products_list = Product.objects.all().select_related('category', 'brand').order_by('-id')
    
    if query:
        products_list = products_list.filter(
            Q(name__icontains=query) |
            Q(sku__icontains=query) |
            Q(category__name__icontains=query)
        )
        
    paginator = Paginator(products_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'active_menu': 'dashboard',
        'global_settings': global_settings,
        'total_products': total_products,
        'total_orders': total_orders,
        'product_families_count': product_families_count,
        'page_obj': page_obj,
        'search_query': query,
    }
    return render(request, 'dashboard/home.html', context)

# Products Management
@manager_required
def admin_products(request):
    query = request.GET.get('search', '').strip()
    products_list = Product.objects.all().select_related('category', 'brand').order_by('-id')
    
    if query:
        products_list = products_list.filter(
            Q(name__icontains=query) |
            Q(sku__icontains=query) |
            Q(category__name__icontains=query) |
            Q(brand__name__icontains=query)
        )
        
    paginator = Paginator(products_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'active_menu': 'products',
        'page_obj': page_obj,
        'search_query': query,
    }
    return render(request, 'dashboard/product_list.html', context)

@manager_required
def admin_product_add(request):
    if request.method == 'POST':
        # Handle Bulk Add / Bulk Update
        if request.POST.get('bulk_action') == 'on':
            bulk_data = request.POST.get('bulk_data', '')
            import json
            import csv
            import io
            count_added = 0
            count_updated = 0
            
            try:
                # Try JSON
                data_list = json.loads(bulk_data)
            except json.JSONDecodeError:
                # Fallback to CSV
                data_list = []
                f = io.StringIO(bulk_data)
                reader = csv.DictReader(f)
                for row in reader:
                    data_list.append(row)
            
            def_cat = Category.objects.first()
            def_brand = Brand.objects.first()
            category_id = request.POST.get('category')
            brand_id = request.POST.get('brand')
            
            for item in data_list:
                sku = item.get('sku')
                name = item.get('name')
                if not name:
                    continue
                    
                cat_name = item.get('category')
                cat = Category.objects.filter(name__iexact=cat_name).first() if cat_name else None
                if not cat:
                    cat = Category.objects.filter(id=category_id).first() or def_cat
                    
                brand_name = item.get('brand')
                brand = Brand.objects.filter(name__iexact=brand_name).first() if brand_name else None
                if not brand:
                    brand = Brand.objects.filter(id=brand_id).first() or def_brand
                
                list_price = Decimal(item.get('list_price', '0.00') or '0.00')
                purchase_price = Decimal(item.get('purchase_price', '0.00') or '0.00')
                
                prod = None
                if sku:
                    prod = Product.objects.filter(sku=sku).first()
                if not prod and name:
                    prod = Product.objects.filter(name__iexact=name).first()
                    
                if prod:
                    # Bulk Update
                    prod.name = name
                    prod.category = cat
                    prod.brand = brand
                    prod.list_price = list_price
                    prod.price = list_price
                    prod.purchase_price = purchase_price
                    prod.currency = item.get('currency', 'INR')
                    prod.publisher = item.get('publisher', prod.publisher)
                    prod.part_number = item.get('part_number', prod.part_number)
                    prod.billing_cycle = item.get('billing_cycle', prod.billing_cycle)
                    prod.term = item.get('term', prod.term)
                    prod.deployment = item.get('deployment', prod.deployment)
                    prod.business_type = item.get('business_type', prod.business_type)
                    prod.support = item.get('support', prod.support)
                    prod.save()
                    count_updated += 1
                else:
                    # Bulk Add
                    if not sku:
                        sku = f"SKU-{slugify(name)[:10].upper()}-{random.randint(1000, 9999)}"
                    catalog_key = f"CAT-{slugify(name)[:10].upper()}-{random.randint(100, 999)}"
                    Product.objects.create(
                        name=name,
                        sku=sku,
                        category=cat,
                        brand=brand,
                        list_price=list_price,
                        price=list_price,
                        purchase_price=purchase_price,
                        currency=item.get('currency', 'INR'),
                        publisher=item.get('publisher', ''),
                        part_number=item.get('part_number', ''),
                        billing_cycle=item.get('billing_cycle', ''),
                        term=item.get('term', ''),
                        catalog_key=catalog_key,
                        deployment=item.get('deployment', 'Cloud / SaaS'),
                        business_type=item.get('business_type', 'Enterprise & Mid-Market'),
                        support=item.get('support', '24/7 Live Support'),
                        stock_qty=100
                    )
                    count_added += 1
            
            messages.success(request, f"Bulk operations completed: {count_added} products added, {count_updated} products updated.")
            return redirect('admin_products')

        # Standard form add
        name = request.POST.get('name')
        category_id = request.POST.get('category')
        brand_id = request.POST.get('brand')
        sub_brand_id = request.POST.get('sub_brand')
        publisher = request.POST.get('publisher', '')
        part_number = request.POST.get('part_number', '')
        billing_cycle = request.POST.get('billing_cycle', '')
        term = request.POST.get('term', '')
        market = request.POST.get('market', '')
        description = request.POST.get('description', '')
        short_desc = request.POST.get('short_desc', '')
        
        deployment = request.POST.get('deployment', 'Cloud / SaaS')
        business_type = request.POST.get('business_type', 'Enterprise & Mid-Market')
        support = request.POST.get('support', '24/7 Live Support')
        best_use_case = request.POST.get('best_use_case', '')
        demo_available = request.POST.get('demo_available') == 'on'
        
        list_price = Decimal(request.POST.get('list_price', '0.00') or '0.00')
        purchase_price = Decimal(request.POST.get('purchase_price', '0.00') or '0.00')
        currency = request.POST.get('currency', 'INR')
        purchase_unit = request.POST.get('purchase_unit', '')
        minimum_quantity = int(request.POST.get('minimum_quantity', '1') or '1')
        
        max_qty_val = request.POST.get('maximum_quantity')
        maximum_quantity = int(max_qty_val) if max_qty_val else None
        
        is_featured = request.POST.get('is_featured') == 'on'
        is_trending = request.POST.get('is_trending') == 'on'
        
        catalog_key = f"CAT-{slugify(name)[:10].upper()}-{random.randint(100, 999)}"
        segment = request.POST.get('segment') or 'Enterprise'
        agreement = request.POST.get('agreement') or 'Standard Agreement'
        region = request.POST.get('region') or 'Global'
        
        category = get_object_or_404(Category, id=category_id)
        brand = get_object_or_404(Brand, id=brand_id)
        
        sub_brand = None
        if sub_brand_id:
            sub_brand = get_object_or_404(SubBrand, id=sub_brand_id)
            
        sku = request.POST.get('sku')
        if not sku:
            sku = f"SKU-{slugify(name)[:10].upper()}-{random.randint(1000, 9999)}"
            
        product = Product.objects.create(
            name=name,
            sku=sku,
            category=category,
            brand=brand,
            sub_brand=sub_brand,
            publisher=publisher,
            part_number=part_number,
            billing_cycle=billing_cycle,
            term=term,
            market=market,
            full_desc=description,
            short_desc=short_desc or (description[:150] if description else ''),
            list_price=list_price,
            price=list_price,
            purchase_price=purchase_price,
            currency=currency,
            purchase_unit=purchase_unit,
            minimum_quantity=minimum_quantity,
            maximum_quantity=maximum_quantity,
            catalog_key=catalog_key,
            segment=segment,
            agreement=agreement,
            region=region,
            is_featured=is_featured,
            is_trending=is_trending,
            is_active=True,
            deployment=deployment,
            business_type=business_type,
            support=support,
            best_use_case=best_use_case,
            demo_available=demo_available,
            stock_qty=100
        )
        
        if 'image_file' in request.FILES:
            product.image_file = request.FILES['image_file']
            product.save()

        # Save Features
        features_list = request.POST.getlist('features')
        for feat_text in features_list:
            if feat_text.strip():
                ProductFeature.objects.create(product=product, feature=feat_text.strip())
                
        # Save Custom Specs
        spec_names = request.POST.getlist('spec_names')
        spec_values = request.POST.getlist('spec_values')
        for s_name, s_val in zip(spec_names, spec_values):
            if s_name.strip() and s_val.strip():
                ProductSpec.objects.create(product=product, name=s_name.strip(), value=s_val.strip())
            
        messages.success(request, f"Product '{product.name}' added successfully.")
        return redirect('admin_products')
        
    categories = Category.objects.filter(is_active=True)
    brands = Brand.objects.filter(is_active=True)
    sub_brands = SubBrand.objects.all()
    
    context = {
        'active_menu': 'products',
        'categories': categories,
        'brands': brands,
        'sub_brands': sub_brands,
        'title': 'Add Product',
    }
    return render(request, 'dashboard/product_form.html', context)

@manager_required
def admin_product_edit(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == 'POST':
        product.name = request.POST.get('name')
        category_id = request.POST.get('category')
        brand_id = request.POST.get('brand')
        sub_brand_id = request.POST.get('sub_brand')
        product.publisher = request.POST.get('publisher', '')
        product.part_number = request.POST.get('part_number', '')
        product.billing_cycle = request.POST.get('billing_cycle', '')
        product.term = request.POST.get('term', '')
        product.market = request.POST.get('market', '')
        product.full_desc = request.POST.get('description', '')
        product.short_desc = request.POST.get('short_desc') or (product.full_desc[:150] if product.full_desc else '')
        
        product.deployment = request.POST.get('deployment', product.deployment)
        product.business_type = request.POST.get('business_type', product.business_type)
        product.support = request.POST.get('support', product.support)
        product.best_use_case = request.POST.get('best_use_case', product.best_use_case)
        product.demo_available = request.POST.get('demo_available') == 'on'
        
        product.list_price = Decimal(request.POST.get('list_price', '0.00') or '0.00')
        product.purchase_price = Decimal(request.POST.get('purchase_price', '0.00') or '0.00')
        product.currency = request.POST.get('currency', 'INR')
        product.purchase_unit = request.POST.get('purchase_unit', '')
        product.minimum_quantity = int(request.POST.get('minimum_quantity', '1') or '1')
        
        max_qty_val = request.POST.get('maximum_quantity')
        product.maximum_quantity = int(max_qty_val) if max_qty_val else None
        
        product.is_featured = request.POST.get('is_featured') == 'on'
        product.is_trending = request.POST.get('is_trending') == 'on'
        
        product.category = get_object_or_404(Category, id=category_id)
        product.brand = get_object_or_404(Brand, id=brand_id)
        
        if sub_brand_id:
            product.sub_brand = get_object_or_404(SubBrand, id=sub_brand_id)
        else:
            product.sub_brand = None
            
        sku_val = request.POST.get('sku')
        if sku_val:
            product.sku = sku_val
            
        if 'image_file' in request.FILES:
            product.image_file = request.FILES['image_file']
            
        product.save()

        # Update Features
        product.features.all().delete()
        features_list = request.POST.getlist('features')
        for feat_text in features_list:
            if feat_text.strip():
                ProductFeature.objects.create(product=product, feature=feat_text.strip())
                
        # Update Custom Specs
        product.specs.all().delete()
        spec_names = request.POST.getlist('spec_names')
        spec_values = request.POST.getlist('spec_values')
        for s_name, s_val in zip(spec_names, spec_values):
            if s_name.strip() and s_val.strip():
                ProductSpec.objects.create(product=product, name=s_name.strip(), value=s_val.strip())
            
        messages.success(request, f"Product '{product.name}' updated successfully.")
        return redirect('admin_products')
        
    categories = Category.objects.filter(is_active=True)
    brands = Brand.objects.filter(is_active=True)
    sub_brands = SubBrand.objects.all()
    
    context = {
        'active_menu': 'products',
        'product': product,
        'categories': categories,
        'brands': brands,
        'sub_brands': sub_brands,
        'title': 'Edit Product',
    }
    return render(request, 'dashboard/product_form.html', context)

@manager_required
def admin_product_delete(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == 'POST':
        product.delete()
        messages.success(request, "Product deleted successfully.")
    return redirect('admin_products')

# Brands Management
@manager_required
def admin_brands(request):
    brands_list = Brand.objects.annotate(product_count=Count('products')).order_by('-id')
    total_brands = brands_list.count()
    total_products = Product.objects.count()
    
    context = {
        'active_menu': 'brands',
        'brands': brands_list,
        'total_brands': total_brands,
        'total_products': total_products,
    }
    return render(request, 'dashboard/brands.html', context)

@manager_required
def admin_brand_add(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description', '')
        is_featured = request.POST.get('is_featured') == 'on'
        
        brand = Brand(name=name, description=description, is_active=is_featured)
        if 'logo' in request.FILES:
            brand.logo = request.FILES['logo']
        brand.save()
        messages.success(request, f"Brand '{brand.name}' added successfully.")
    return redirect('admin_brands')

@manager_required
def admin_brand_delete(request, brand_id):
    brand = get_object_or_404(Brand, id=brand_id)
    if request.method == 'POST':
        brand.delete()
        messages.success(request, "Brand deleted successfully.")
    return redirect('admin_brands')

# Sub Brands Management
@manager_required
def admin_sub_brands(request):
    sub_brands_list = SubBrand.objects.annotate(product_count=Count('products')).select_related('brand').order_by('-id')
    brands = Brand.objects.all()
    
    # Filter pills by Brand ID
    brand_filter = request.GET.get('brand')
    if brand_filter:
        sub_brands_list = sub_brands_list.filter(brand_id=brand_filter)
        
    total_sub_brands = SubBrand.objects.count()
    # Total brand families refers to the count of brands that have sub brands
    total_brand_families = SubBrand.objects.values('brand').distinct().count()
    
    context = {
        'active_menu': 'sub_brands',
        'sub_brands': sub_brands_list,
        'brands': brands,
        'selected_brand_id': int(brand_filter) if brand_filter else None,
        'total_sub_brands': total_sub_brands,
        'total_brand_families': total_brand_families,
    }
    return render(request, 'dashboard/sub_brands.html', context)

@manager_required
def admin_sub_brand_add(request):
    if request.method == 'POST':
        brand_id = request.POST.get('brand')
        name = request.POST.get('name')
        
        brand = get_object_or_404(Brand, id=brand_id)
        sub_brand, created = SubBrand.objects.get_or_create(brand=brand, name=name)
        if created:
            messages.success(request, f"Sub Brand '{sub_brand.name}' created.")
        else:
            messages.warning(request, f"Sub Brand '{name}' already exists for Brand '{brand.name}'.")
    return redirect('admin_sub_brands')

@manager_required
def admin_sub_brand_delete(request, sub_brand_id):
    sub_brand = get_object_or_404(SubBrand, id=sub_brand_id)
    if request.method == 'POST':
        sub_brand.delete()
        messages.success(request, "Sub Brand deleted successfully.")
    return redirect('admin_sub_brands')

# Users Management
@manager_required
def admin_users(request):
    query = request.GET.get('search', '').strip()
    users_list = User.objects.all().order_by('-id')
    
    if query:
        users_list = users_list.filter(
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(profile__company_name__icontains=query)
        )
        
    paginator = Paginator(users_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'active_menu': 'users',
        'page_obj': page_obj,
        'search_query': query,
        'roles': User.USER_TYPE_CHOICES,
    }
    return render(request, 'dashboard/users.html', context)

@manager_required
def admin_user_edit(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        user.email = request.POST.get('email')
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.user_type = request.POST.get('role', 'customer')
        
        # Company & Phone parameters in user profile
        profile = user.profile
        profile.company_name = request.POST.get('company', '')
        profile.phone_number = request.POST.get('phone', '')
        profile.save()
        
        # Account activation
        is_active = request.POST.get('is_active') == 'on'
        user.is_active = is_active
        user.save()
        
        messages.success(request, f"User '{user.username}' updated successfully.")
    return redirect('admin_users')

@manager_required
def admin_user_delete(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        user.delete()
        messages.success(request, "User deleted successfully.")
    return redirect('admin_users')

# Orders Management
@manager_required
def admin_orders(request):
    query = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    
    orders_list = Order.objects.all().select_related('user').order_by('-id')
    
    if query:
        orders_list = orders_list.filter(
            Q(order_number__icontains=query) |
            Q(user__email__icontains=query) |
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query)
        )
        
    if status_filter:
        orders_list = orders_list.filter(order_status=status_filter)
        
    paginator = Paginator(orders_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'active_menu': 'orders',
        'page_obj': page_obj,
        'search_query': query,
        'status_filter': status_filter,
        'status_choices': Order.ORDER_STATUS_CHOICES,
    }
    return render(request, 'dashboard/order_list.html', context)

@manager_required
def admin_order_detail(request, order_number):
    order = get_object_or_404(Order, order_number=order_number)
    items = order.items.all().select_related('product')
    
    context = {
        'active_menu': 'orders',
        'order': order,
        'items': items,
        'status_choices': Order.ORDER_STATUS_CHOICES,
    }
    return render(request, 'dashboard/order_detail.html', context)

@manager_required
def admin_order_status_update(request, order_number):
    order = get_object_or_404(Order, order_number=order_number)
    if request.method == 'POST':
        status = request.POST.get('status')
        if status in dict(Order.ORDER_STATUS_CHOICES):
            order.order_status = status
            order.save()
            messages.success(request, f"Order status updated to {status.capitalize()}.")
    return redirect('admin_order_detail', order_number=order_number)

# Settings Management
@manager_required
def admin_settings(request):
    global_settings = load_global_settings()
    
    if request.method == 'POST':
        # General, Shop and Checkout Settings
        global_settings['admin_email'] = request.POST.get('admin_email', 'admin@techno360.com')
        global_settings['base_currency'] = request.POST.get('base_currency', 'INR')
        global_settings['shop_enabled'] = request.POST.get('shop_enabled') == 'on'
        global_settings['cart_enabled'] = request.POST.get('cart_enabled') == 'on'
        global_settings['checkout_enabled'] = request.POST.get('checkout_enabled') == 'on'
        
        # Website Logo Link or Upload File
        if 'website_logo_file' in request.FILES:
            logo_file = request.FILES['website_logo_file']
            from django.core.files.storage import FileSystemStorage
            fs = FileSystemStorage()
            filename = fs.save('logo/' + logo_file.name, logo_file)
            global_settings['website_logo'] = fs.url(filename)
        elif request.POST.get('website_logo'):
            global_settings['website_logo'] = request.POST.get('website_logo')
            
        save_global_settings(global_settings)
        messages.success(request, "Global settings updated successfully.")
        return redirect('admin_settings')
        
    context = {
        'active_menu': 'settings',
        'settings': global_settings,
    }
    return render(request, 'dashboard/settings.html', context)


# Quotations Management
from django.http import JsonResponse
from django.db import transaction
from django.utils import timezone
import datetime
from orders.models import (
    Quotation, QuotationItem, QuotationAddOn, 
    QuotationStatusHistory, QuotationNote, QuotationPublicLink
)
from products.models import ProductVariant

@manager_required
def admin_quotations(request):
    query = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '').strip()
    client_filter = request.GET.get('client', '').strip()
    currency_filter = request.GET.get('currency', '').strip()
    sort_by = request.GET.get('sort', '-id')
    
    start_date = request.GET.get('start_date', '').strip()
    end_date = request.GET.get('end_date', '').strip()
    
    quotes_list = Quotation.objects.all().select_related('user', 'created_by')
    
    if query:
        quotes_list = quotes_list.filter(
            Q(quotation_number__icontains=query) |
            Q(client_name__icontains=query) |
            Q(email__icontains=query) |
            Q(contact_person__icontains=query)
        )
        
    if status_filter:
        quotes_list = quotes_list.filter(status=status_filter)
        
    if client_filter:
        quotes_list = quotes_list.filter(user_id=client_filter)
        
    if currency_filter:
        quotes_list = quotes_list.filter(currency=currency_filter)
        
    if start_date:
        quotes_list = quotes_list.filter(created_at__date__gte=start_date)
    if end_date:
        quotes_list = quotes_list.filter(created_at__date__lte=end_date)
        
    # Validation of sorting parameter
    allowed_sorts = ['id', '-id', 'quotation_number', '-quotation_number', 'total', '-total', 'valid_until', '-valid_until', 'created_at', '-created_at']
    if sort_by in allowed_sorts:
        quotes_list = quotes_list.order_by(sort_by)
    else:
        quotes_list = quotes_list.order_by('-id')
        
    paginator = Paginator(quotes_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Get all users for the client filter
    clients = User.objects.filter(is_customer=True)
    
    # Count metrics for sidebar categories
    draft_count = Quotation.objects.filter(status='draft').count()
    sent_count = Quotation.objects.filter(status='sent').count()
    accepted_count = Quotation.objects.filter(status='accepted').count()
    rejected_count = Quotation.objects.filter(status='rejected').count()
    
    context = {
        'active_menu': 'quotations',
        'page_obj': page_obj,
        'search_query': query,
        'status_filter': status_filter,
        'client_filter': client_filter,
        'currency_filter': currency_filter,
        'start_date': start_date,
        'end_date': end_date,
        'sort_by': sort_by,
        'status_choices': Quotation.STATUS_CHOICES,
        'clients': clients,
        'draft_count': draft_count,
        'sent_count': sent_count,
        'accepted_count': accepted_count,
        'rejected_count': rejected_count,
        'total_quotes': Quotation.objects.count()
    }
    return render(request, 'dashboard/quotation_list.html', context)

@manager_required
def admin_quotation_detail(request, quotation_number):
    quotation = get_object_or_404(Quotation, quotation_number=quotation_number)
    # Ensure public link exists
    QuotationPublicLink.objects.get_or_create(quotation=quotation)
    items = quotation.items.all().select_related('category', 'product', 'variant')
    history = quotation.status_history.all().select_related('changed_by')
    notes = quotation.notes_history.all().select_related('author')
    
    # Handle direct note posting
    if request.method == 'POST' and 'add_note' in request.POST:
        text = request.POST.get('note_text', '').strip()
        note_type = request.POST.get('note_type', 'internal')
        if text:
            QuotationNote.objects.create(
                quotation=quotation,
                author=request.user,
                note_type=note_type,
                text=text
            )
            messages.success(request, "Note logged successfully.")
        return redirect('admin_quotation_detail', quotation_number=quotation_number)
        
    # Handle status updating
    if request.method == 'POST' and 'update_status' in request.POST:
        new_status = request.POST.get('status')
        status_notes = request.POST.get('status_notes', '').strip()
        if new_status in dict(Quotation.STATUS_CHOICES):
            quotation.status = new_status
            quotation.save()
            
            QuotationStatusHistory.objects.create(
                quotation=quotation,
                status=new_status,
                changed_by=request.user,
                notes=status_notes
            )
            
            messages.success(request, f"Quotation status updated to {new_status.capitalize()}.")
        return redirect('admin_quotation_detail', quotation_number=quotation_number)
        
    context = {
        'active_menu': 'quotations',
        'quotation': quotation,
        'items': items,
        'history': history,
        'notes': notes,
        'status_choices': Quotation.STATUS_CHOICES,
    }
    return render(request, 'dashboard/quotation_detail.html', context)

@manager_required
def admin_quotation_add(request):
    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Read user and client parameters
                user_id = request.POST.get('user')
                user = User.objects.filter(id=user_id).first() if user_id else None
                
                client_name = request.POST.get('client_name', '').strip()
                contact_person = request.POST.get('contact_person', '').strip()
                email = request.POST.get('email', '').strip()
                phone = request.POST.get('phone', '').strip()
                market_region = request.POST.get('market_region', '').strip()
                gstin_tax_id = request.POST.get('gstin_tax_id', '').strip()
                
                currency = request.POST.get('currency', 'AED')
                valid_days = int(request.POST.get('valid_days', '30') or '30')
                valid_until = timezone.now().date() + datetime.timedelta(days=valid_days)
                
                overall_discount_val = Decimal(request.POST.get('overall_discount_val', '0.00') or '0.00')
                overall_discount_type = request.POST.get('overall_discount_type', 'fixed')
                
                terms_conditions = request.POST.get('terms_conditions', '').strip()
                admin_notes = request.POST.get('admin_notes', '').strip()
                customer_notes = request.POST.get('customer_notes', '').strip()
                
                # Quotation item rows
                item_count = int(request.POST.get('item_count', '0'))
                line_items_data = []
                
                for i in range(1, item_count + 1):
                    # Check if row key exists
                    if f'item_prod_name_{i}' in request.POST:
                        category_id = request.POST.get(f'item_category_{i}')
                        category = Category.objects.filter(id=category_id).first() if category_id else None
                        
                        product_id = request.POST.get(f'item_product_{i}')
                        product = Product.objects.filter(id=product_id).first() if product_id else None
                        
                        product_name = request.POST.get(f'item_prod_name_{i}', '').strip()
                        
                        variant_id = request.POST.get(f'item_variant_{i}')
                        variant = ProductVariant.objects.filter(id=variant_id).first() if variant_id else None
                        variant_name = request.POST.get(f'item_var_name_{i}', '').strip()
                        
                        duration = request.POST.get(f'item_duration_{i}', 'monthly')
                        quantity = int(request.POST.get(f'item_qty_{i}', '1') or '1')
                        price = Decimal(request.POST.get(f'item_price_{i}', '0.00') or '0.00')
                        
                        discount_value = Decimal(request.POST.get(f'item_disc_val_{i}', '0.00') or '0.00')
                        discount_type = request.POST.get(f'item_disc_type_{i}', 'fixed')
                        tax_percentage = Decimal(request.POST.get(f'item_tax_pct_{i}', '5.00') or '5.00')
                        
                        # Add-on pricing parameter check
                        addon_names = request.POST.getlist(f'addon_name_{i}[]')
                        addon_prices = request.POST.getlist(f'addon_price_{i}[]')
                        addon_qtys = request.POST.getlist(f'addon_qty_{i}[]')
                        
                        line_items_data.append({
                            'category': category,
                            'product': product,
                            'product_name': product_name or (product.name if product else 'Custom Product'),
                            'variant': variant,
                            'variant_name': variant_name or (variant.name if variant else ''),
                            'duration': duration,
                            'quantity': quantity,
                            'price': price,
                            'discount_type': discount_type,
                            'discount_value': discount_value,
                            'tax_percentage': tax_percentage,
                            'addons': list(zip(addon_names, addon_prices, addon_qtys))
                        })
                
                # Enforce validation: at least one line item
                if not line_items_data:
                    messages.error(request, "Failed to create quotation: Please supply at least one valid line item.")
                    return redirect('admin_quotation_add')
                
                # Perform full server-side math validation to secure totals
                running_subtotal = Decimal('0.00')
                running_item_discount = Decimal('0.00')
                running_tax = Decimal('0.00')
                
                processed_items = []
                
                for item in line_items_data:
                    sub = item['quantity'] * item['price']
                    
                    # Calculate item discount
                    if item['discount_type'] == 'percentage':
                        disc = sub * (item['discount_value'] / Decimal('100.00'))
                    else:
                        disc = item['discount_value']
                    
                    taxable = sub - disc
                    tax_amt = taxable * (item['tax_percentage'] / Decimal('100.00'))
                    final_tot = taxable + tax_amt
                    
                    running_subtotal += sub
                    running_item_discount += disc
                    running_tax += tax_amt
                    
                    processed_items.append({
                        'category': item['category'],
                        'product': item['product'],
                        'product_name': item['product_name'],
                        'variant': item['variant'],
                        'variant_name': item['variant_name'],
                        'duration': item['duration'],
                        'quantity': item['quantity'],
                        'price': item['price'],
                        'discount_type': item['discount_type'],
                        'discount_value': item['discount_value'],
                        'tax_percentage': item['tax_percentage'],
                        'subtotal': sub,
                        'tax_amount': tax_amt,
                        'final_total': final_tot,
                        'addons_data': item['addons']
                    })
                
                # Calculate overall discount
                if overall_discount_type == 'percentage':
                    overall_disc = running_subtotal * (overall_discount_val / Decimal('100.00'))
                else:
                    overall_disc = overall_discount_val
                
                taxable_amount = running_subtotal - running_item_discount - overall_disc
                grand_total = taxable_amount + running_tax
                
                # Generate unique Quotation number
                quotation_number = f"QT-{timezone.now().year}-{random.randint(1000, 9999)}"
                while Quotation.objects.filter(quotation_number=quotation_number).exists():
                    quotation_number = f"QT-{timezone.now().year}-{random.randint(1000, 9999)}"
                
                # Create Quotation
                quotation = Quotation.objects.create(
                    quotation_number=quotation_number,
                    user=user,
                    status='draft',
                    client_name=client_name or (user.get_full_name() or user.username if user else 'Guest Client'),
                    contact_person=contact_person or (user.get_full_name() if user else ''),
                    email=email or (user.email if user else ''),
                    phone=phone or (user.profile.phone_number if user and hasattr(user, 'profile') else ''),
                    market_region=market_region,
                    gstin_tax_id=gstin_tax_id,
                    currency=currency,
                    subtotal=running_subtotal,
                    item_discount=running_item_discount,
                    overall_discount_val=overall_discount_val,
                    overall_discount_type=overall_discount_type,
                    taxable_amount=taxable_amount,
                    tax=running_tax,
                    total=grand_total,
                    terms_conditions=terms_conditions or "Payment within 30 days. Software licenses delivered electronically.",
                    admin_notes=admin_notes,
                    customer_notes=customer_notes,
                    valid_until=valid_until,
                    created_by=request.user
                )
                
                # Create items and add-ons
                for pi in processed_items:
                    qi = QuotationItem.objects.create(
                        quotation=quotation,
                        category=pi['category'],
                        product=pi['product'],
                        product_name=pi['product_name'],
                        variant=pi['variant'],
                        variant_name=pi['variant_name'],
                        duration=pi['duration'],
                        quantity=pi['quantity'],
                        price=pi['price'],
                        discount_type=pi['discount_type'],
                        discount_value=pi['discount_value'],
                        tax_percentage=pi['tax_percentage'],
                        subtotal=pi['subtotal'],
                        tax_amount=pi['tax_amount'],
                        final_total=pi['final_total']
                    )
                    
                    # Create Add-ons
                    for add_name, add_price, add_qty in pi['addons_data']:
                        if add_name:
                            QuotationAddOn.objects.create(
                                quotation_item=qi,
                                name=add_name,
                                price=Decimal(add_price or '0.00'),
                                quantity=int(add_qty or '1')
                            )
                
                # Log Status History
                QuotationStatusHistory.objects.create(
                    quotation=quotation,
                    status='draft',
                    changed_by=request.user,
                    notes="Quotation initialized as draft."
                )
                
                # Register Public Link
                QuotationPublicLink.objects.create(quotation=quotation)
                
                messages.success(request, f"Quotation '{quotation.quotation_number}' created successfully.")
                return redirect('admin_quotations')
                
        except Exception as ex:
            messages.error(request, f"Error saving quotation: {str(ex)}")
            return redirect('admin_quotation_add')
            
    users = User.objects.all()
    products = Product.objects.filter(is_active=True).select_related('category')
    categories = Category.objects.filter(is_active=True)
    
    default_terms = "1. Quotation validity is 30 days from date of issuance.\n2. Payment terms: 100% upfront for SaaS subscription models.\n3. Implementation and deployment support will commence post receipt of purchase order (PO)."
    
    context = {
        'active_menu': 'quotations',
        'users': users,
        'products': products,
        'categories': categories,
        'default_terms': default_terms,
        'current_year': timezone.now().year,
        'generated_quote_number': f"QT-{timezone.now().year}-{random.randint(1000, 9999)}"
    }
    return render(request, 'dashboard/quotation_form.html', context)

@manager_required
def admin_quotation_edit(request, quotation_id):
    quotation = get_object_or_404(Quotation, id=quotation_id)
    if quotation.status != 'draft':
        messages.error(request, "Only draft quotations can be modified.")
        return redirect('admin_quotation_detail', quotation_number=quotation.quotation_number)
        
    if request.method == 'POST':
        try:
            with transaction.atomic():
                user_id = request.POST.get('user')
                quotation.user = User.objects.filter(id=user_id).first() if user_id else None
                
                quotation.client_name = request.POST.get('client_name', '').strip()
                quotation.contact_person = request.POST.get('contact_person', '').strip()
                quotation.email = request.POST.get('email', '').strip()
                quotation.phone = request.POST.get('phone', '').strip()
                quotation.market_region = request.POST.get('market_region', '').strip()
                quotation.gstin_tax_id = request.POST.get('gstin_tax_id', '').strip()
                
                quotation.currency = request.POST.get('currency', 'AED')
                valid_days = int(request.POST.get('valid_days', '30') or '30')
                quotation.valid_until = timezone.now().date() + datetime.timedelta(days=valid_days)
                
                quotation.overall_discount_val = Decimal(request.POST.get('overall_discount_val', '0.00') or '0.00')
                quotation.overall_discount_type = request.POST.get('overall_discount_type', 'fixed')
                
                quotation.terms_conditions = request.POST.get('terms_conditions', '').strip()
                quotation.admin_notes = request.POST.get('admin_notes', '').strip()
                quotation.customer_notes = request.POST.get('customer_notes', '').strip()
                
                # Quotation item rows
                item_count = int(request.POST.get('item_count', '0'))
                line_items_data = []
                
                for i in range(1, item_count + 1):
                    if f'item_prod_name_{i}' in request.POST:
                        category_id = request.POST.get(f'item_category_{i}')
                        category = Category.objects.filter(id=category_id).first() if category_id else None
                        
                        product_id = request.POST.get(f'item_product_{i}')
                        product = Product.objects.filter(id=product_id).first() if product_id else None
                        
                        product_name = request.POST.get(f'item_prod_name_{i}', '').strip()
                        
                        variant_id = request.POST.get(f'item_variant_{i}')
                        variant = ProductVariant.objects.filter(id=variant_id).first() if variant_id else None
                        variant_name = request.POST.get(f'item_var_name_{i}', '').strip()
                        
                        duration = request.POST.get(f'item_duration_{i}', 'monthly')
                        quantity = int(request.POST.get(f'item_qty_{i}', '1') or '1')
                        price = Decimal(request.POST.get(f'item_price_{i}', '0.00') or '0.00')
                        
                        discount_value = Decimal(request.POST.get(f'item_disc_val_{i}', '0.00') or '0.00')
                        discount_type = request.POST.get(f'item_disc_type_{i}', 'fixed')
                        tax_percentage = Decimal(request.POST.get(f'item_tax_pct_{i}', '5.00') or '5.00')
                        
                        addon_names = request.POST.getlist(f'addon_name_{i}[]')
                        addon_prices = request.POST.getlist(f'addon_price_{i}[]')
                        addon_qtys = request.POST.getlist(f'addon_qty_{i}[]')
                        
                        line_items_data.append({
                            'category': category,
                            'product': product,
                            'product_name': product_name or (product.name if product else 'Custom Product'),
                            'variant': variant,
                            'variant_name': variant_name or (variant.name if variant else ''),
                            'duration': duration,
                            'quantity': quantity,
                            'price': price,
                            'discount_type': discount_type,
                            'discount_value': discount_value,
                            'tax_percentage': tax_percentage,
                            'addons': list(zip(addon_names, addon_prices, addon_qtys))
                        })
                        
                if not line_items_data:
                    messages.error(request, "Failed to edit quotation: Please supply at least one valid line item.")
                    return redirect('admin_quotation_edit', quotation_id=quotation.id)
                
                # Calculate backend values
                running_subtotal = Decimal('0.00')
                running_item_discount = Decimal('0.00')
                running_tax = Decimal('0.00')
                
                # Delete existing items first
                quotation.items.all().delete()
                
                for item in line_items_data:
                    sub = item['quantity'] * item['price']
                    
                    if item['discount_type'] == 'percentage':
                        disc = sub * (item['discount_value'] / Decimal('100.00'))
                    else:
                        disc = item['discount_value']
                        
                    taxable = sub - disc
                    tax_amt = taxable * (item['tax_percentage'] / Decimal('100.00'))
                    final_tot = taxable + tax_amt
                    
                    running_subtotal += sub
                    running_item_discount += disc
                    running_tax += tax_amt
                    
                    qi = QuotationItem.objects.create(
                        quotation=quotation,
                        category=item['category'],
                        product=item['product'],
                        product_name=item['product_name'],
                        variant=item['variant'],
                        variant_name=item['variant_name'],
                        duration=item['duration'],
                        quantity=item['quantity'],
                        price=item['price'],
                        discount_type=item['discount_type'],
                        discount_value=item['discount_value'],
                        tax_percentage=item['tax_percentage'],
                        subtotal=sub,
                        tax_amount=tax_amt,
                        final_total=final_tot
                    )
                    
                    for add_name, add_price, add_qty in item['addons']:
                        if add_name:
                            QuotationAddOn.objects.create(
                                quotation_item=qi,
                                name=add_name,
                                price=Decimal(add_price or '0.00'),
                                quantity=int(add_qty or '1')
                            )
                
                if quotation.overall_discount_type == 'percentage':
                    overall_disc = running_subtotal * (quotation.overall_discount_val / Decimal('100.00'))
                else:
                    overall_disc = quotation.overall_discount_val
                    
                quotation.subtotal = running_subtotal
                quotation.item_discount = running_item_discount
                quotation.taxable_amount = running_subtotal - running_item_discount - overall_disc
                quotation.tax = running_tax
                quotation.total = quotation.taxable_amount + running_tax
                quotation.save()
                
                QuotationStatusHistory.objects.create(
                    quotation=quotation,
                    status=quotation.status,
                    changed_by=request.user,
                    notes="Quotation updated."
                )
                
                messages.success(request, f"Quotation '{quotation.quotation_number}' updated successfully.")
                return redirect('admin_quotation_detail', quotation_number=quotation.quotation_number)
                
        except Exception as ex:
            messages.error(request, f"Error saving quotation: {str(ex)}")
            return redirect('admin_quotation_edit', quotation_id=quotation.id)
            
    users = User.objects.all()
    products = Product.objects.filter(is_active=True).select_related('category')
    categories = Category.objects.filter(is_active=True)
    items = quotation.items.all().select_related('product', 'category', 'variant')
    
    # Calculate validity period
    valid_period_days = 30
    if quotation.valid_until and quotation.created_at:
        valid_period_days = (quotation.valid_until - quotation.created_at.date()).days
        
    context = {
        'active_menu': 'quotations',
        'quotation': quotation,
        'items': items,
        'users': users,
        'products': products,
        'categories': categories,
        'valid_period_days': valid_period_days
    }
    return render(request, 'dashboard/quotation_form.html', context)

@manager_required
def admin_quotation_duplicate(request, quotation_id):
    original = get_object_or_404(Quotation, id=quotation_id)
    
    try:
        with transaction.atomic():
            new_number = f"QT-{timezone.now().year}-{random.randint(1000, 9999)}"
            while Quotation.objects.filter(quotation_number=new_number).exists():
                new_number = f"QT-{timezone.now().year}-{random.randint(1000, 9999)}"
                
            clone = Quotation.objects.create(
                quotation_number=new_number,
                user=original.user,
                status='draft',
                client_name=original.client_name,
                contact_person=original.contact_person,
                email=original.email,
                phone=original.phone,
                market_region=original.market_region,
                gstin_tax_id=original.gstin_tax_id,
                currency=original.currency,
                subtotal=original.subtotal,
                item_discount=original.item_discount,
                overall_discount_val=original.overall_discount_val,
                overall_discount_type=original.overall_discount_type,
                taxable_amount=original.taxable_amount,
                tax=original.tax,
                total=original.total,
                terms_conditions=original.terms_conditions,
                admin_notes=f"Cloned from {original.quotation_number}.",
                customer_notes=original.customer_notes,
                valid_until=timezone.now().date() + datetime.timedelta(days=30),
                created_by=request.user
            )
            
            for item in original.items.all():
                qi = QuotationItem.objects.create(
                    quotation=clone,
                    category=item.category,
                    product=item.product,
                    product_name=item.product_name,
                    variant=item.variant,
                    variant_name=item.variant_name,
                    duration=item.duration,
                    quantity=item.quantity,
                    price=item.price,
                    discount_type=item.discount_type,
                    discount_value=item.discount_value,
                    tax_percentage=item.tax_percentage,
                    subtotal=item.subtotal,
                    tax_amount=item.tax_amount,
                    final_total=item.final_total
                )
                
                for addon in item.addons.all():
                    QuotationAddOn.objects.create(
                        quotation_item=qi,
                        product=addon.product,
                        name=addon.name,
                        price=addon.price,
                        quantity=addon.quantity
                    )
                    
            QuotationStatusHistory.objects.create(
                quotation=clone,
                status='draft',
                changed_by=request.user,
                notes=f"Quotation duplicated from {original.quotation_number}."
            )
            
            QuotationPublicLink.objects.create(quotation=clone)
            
            messages.success(request, f"Quotation duplicated successfully as {clone.quotation_number}.")
            return redirect('admin_quotation_detail', quotation_number=clone.quotation_number)
            
    except Exception as ex:
        messages.error(request, f"Cloning error: {str(ex)}")
        return redirect('admin_quotations')

@manager_required
def admin_quotation_delete(request, quotation_id):
    quotation = get_object_or_404(Quotation, id=quotation_id)
    if request.method == 'POST':
        quotation.delete()
        messages.success(request, "Quotation deleted successfully.")
    return redirect('admin_quotations')

@manager_required
def admin_quotation_convert_order(request, quotation_id):
    quotation = get_object_or_404(Quotation, id=quotation_id)
    if quotation.status == 'converted':
        messages.error(request, "This quotation has already been converted to an order.")
        return redirect('admin_quotation_detail', quotation_number=quotation.quotation_number)
        
    try:
        with transaction.atomic():
            # Setup/get user for order
            user = quotation.user
            if not user:
                # If no user profile exists, check if email matches or create standard Guest user
                user = User.objects.filter(email=quotation.email).first()
                if not user:
                    # Generate random customer profile
                    import uuid
                    username = f"client_{random.randint(1000, 9999)}"
                    user = User.objects.create_user(
                        username=username,
                        email=quotation.email,
                        password=uuid.uuid4().hex,
                        first_name=quotation.contact_person,
                        is_customer=True
                    )
            
            order_number = f"T360-{timezone.now().year}-{random.randint(10000, 99999)}"
            while Order.objects.filter(order_number=order_number).exists():
                order_number = f"T360-{timezone.now().year}-{random.randint(10000, 99999)}"
                
            # Create Order
            order = Order.objects.create(
                order_number=order_number,
                user=user,
                payment_method='bank_transfer',
                payment_status='pending',
                order_status='pending',
                subtotal=quotation.subtotal,
                discount=quotation.item_discount + (quotation.subtotal * quotation.overall_discount_val / 100 if quotation.overall_discount_type == 'percentage' else quotation.overall_discount_val),
                tax=quotation.tax,
                shipping_cost=Decimal('0.00'),
                total=quotation.total,
                billing_address={'full_name': quotation.client_name, 'phone': quotation.phone, 'address_line1': quotation.market_region, 'city': 'N/A', 'state': 'N/A', 'postal_code': 'N/A', 'country': 'N/A'},
                shipping_address={'full_name': quotation.client_name, 'phone': quotation.phone, 'address_line1': quotation.market_region, 'city': 'N/A', 'state': 'N/A', 'postal_code': 'N/A', 'country': 'N/A'}
            )
            
            # Create Order Items and generate subscriptions/licenses
            for item in quotation.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.price,
                    plan=item.duration
                )
                
                # Automatically generate licenses / subscriptions for active order conversion
                if item.product:
                    if item.duration in ['monthly', 'yearly']:
                        # Create subscription
                        days = 30 if item.duration == 'monthly' else 365
                        Subscription.objects.create(
                            subscription_number=f"SUB-{random.randint(100000, 999999)}",
                            product=item.product,
                            user=user,
                            status='active',
                            plan_type=item.duration,
                            start_date=timezone.now().date(),
                            end_date=timezone.now().date() + datetime.timedelta(days=days),
                            price=item.price
                        )
                    else:
                        # Create perpetual license
                        License.objects.create(
                            license_key=f"LIC-{uuid.uuid4().hex[:16].upper()}",
                            product=item.product,
                            user=user,
                            order=order,
                            status='active',
                            expires_at=timezone.now() + datetime.timedelta(days=365) # 1 Year default
                        )
            
            # Update quotation status
            quotation.status = 'converted'
            quotation.save()
            
            QuotationStatusHistory.objects.create(
                quotation=quotation,
                status='converted',
                changed_by=request.user,
                notes=f"Converted directly to client Order {order.order_number}."
            )
            
            messages.success(request, f"Quotation converted to Order '{order.order_number}' successfully.")
            return redirect('admin_order_detail', order_number=order.order_number)
            
    except Exception as ex:
        messages.error(request, f"Order conversion failure: {str(ex)}")
        return redirect('admin_quotation_detail', quotation_number=quotation.quotation_number)

@manager_required
def admin_quotation_pdf(request, quotation_number):
    quotation = get_object_or_404(Quotation, quotation_number=quotation_number)
    items = quotation.items.all().select_related('product', 'variant')
    
    # Render customized printer-friendly print-ready layout
    context = {
        'quotation': quotation,
        'items': items,
        'is_pdf_view': True,
    }
    return render(request, 'dashboard/quotation_print.html', context)

def public_quotation_view(request, token):
    link = get_object_or_404(QuotationPublicLink, token=token, is_active=True)
    quotation = link.quotation
    items = quotation.items.all().select_related('product', 'category', 'variant')
    
    # Increment view counter
    link.view_count += 1
    link.last_viewed = timezone.now()
    link.save()
    
    # Transition to viewed if currently sent
    if quotation.status == 'sent':
        quotation.status = 'viewed'
        quotation.save()
        
        QuotationStatusHistory.objects.create(
            quotation=quotation,
            status='viewed',
            notes="Quotation viewed by client via shared link."
        )
        
    # Handle user client action Accept/Reject
    if request.method == 'POST':
        action = request.POST.get('client_action')
        feedback = request.POST.get('feedback_notes', '').strip()
        
        if action in ['accept', 'reject']:
            status_map = {'accept': 'accepted', 'reject': 'rejected'}
            quotation.status = status_map[action]
            quotation.save()
            
            QuotationStatusHistory.objects.create(
                quotation=quotation,
                status=status_map[action],
                notes=f"Client action: {action.upper()}. Feedback: {feedback}"
            )
            
            messages.success(request, f"Thank you! You have {action}ed this quotation proposal.")
            return redirect('public_quotation_view', token=token)
            
    context = {
        'quotation': quotation,
        'items': items,
        'public_token': token
    }
    return render(request, 'accounts/public_quotation.html', context)


# AJAX views
@manager_required
def ajax_get_products_by_category(request):
    category_id = request.GET.get('category_id')
    if category_id:
        products = Product.objects.filter(category_id=category_id, is_active=True).values('id', 'name', 'list_price', 'currency')
        return JsonResponse({'products': list(products)})
    return JsonResponse({'products': []})

@manager_required
def ajax_get_variants_by_product(request):
    product_id = request.GET.get('product_id')
    if product_id:
        variants = ProductVariant.objects.filter(product_id=product_id).values('id', 'name', 'price')
        return JsonResponse({'variants': list(variants)})
    return JsonResponse({'variants': []})

@manager_required
def ajax_get_client_details(request):
    user_id = request.GET.get('user_id')
    if user_id:
        user = User.objects.filter(id=user_id).first()
        if user:
            address_obj = user.addresses.filter(address_type='billing').first()
            address_str = f"{address_obj.address_line1}, {address_obj.city}, {address_obj.state}" if address_obj else ""
            
            return JsonResponse({
                'success': True,
                'client_name': user.profile.company_name or (user.get_full_name() or user.username),
                'contact_person': user.get_full_name() or user.username,
                'email': user.email,
                'phone': user.profile.phone_number or '',
                'market_region': address_str or 'India',
                'gstin_tax_id': ''
            })
    return JsonResponse({'success': False})

@manager_required
def admin_wallet_view(request):
    return render(request, 'dashboard/wallet.html', {'active_menu': 'wallet'})

@manager_required
def admin_referrals_view(request):
    return render(request, 'dashboard/referrals.html', {'active_menu': 'referrals'})

@manager_required
def admin_transactions_view(request):
    return render(request, 'dashboard/transactions.html', {'active_menu': 'wallet'})

@manager_required
def admin_withdrawals_view(request):
    return render(request, 'dashboard/withdrawals.html', {'active_menu': 'wallet'})
