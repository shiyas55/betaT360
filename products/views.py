from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Avg
from django.core.paginator import Paginator
from .models import Category, Brand, Product, Review, Wishlist

def product_list(request):
    products_qs = Product.objects.filter(is_active=True)
    
    # Extract filter parameters
    category_slug = request.GET.get('category')
    brand_slugs = request.GET.getlist('brand')
    price_tier = request.GET.get('price')
    deployments = request.GET.getlist('deployment')
    search_query = request.GET.get('search')
    sort_by = request.GET.get('sort', 'newest')
    
    # 1. Filter by Category
    active_category = None
    if category_slug:
        active_category = Category.objects.filter(slug=category_slug).first()
        if active_category:
            products_qs = products_qs.filter(category=active_category)
        else:
            products_qs = products_qs.none()
            
    # 2. Filter by Brand (slug or name)
    if brand_slugs:
        # Check if list has elements, supports checking by slug
        products_qs = products_qs.filter(brand__name__in=brand_slugs) | products_qs.filter(brand__slug__in=brand_slugs)

    # 3. Filter by Price Tier (using USD prices)
    if price_tier:
        if price_tier == 'free-payg':
            products_qs = products_qs.filter(price=0)
        elif price_tier == 'under-50':
            products_qs = products_qs.filter(price__gt=0, price__lte=50)
        elif price_tier == 'over-50':
            products_qs = products_qs.filter(price__gt=50)

    # 4. Filter by Deployment
    if deployments:
        products_qs = products_qs.filter(deployment__in=deployments)

    # 5. Filter by Search Query
    if search_query:
        products_qs = products_qs.filter(
            Q(name__icontains=search_query) |
            Q(short_desc__icontains=search_query) |
            Q(full_desc__icontains=search_query) |
            Q(sku__icontains=search_query) |
            Q(brand__name__icontains=search_query)
        )

    # 6. Sorting
    if sort_by == 'price_asc':
        products_qs = products_qs.order_by('price')
    elif sort_by == 'price_desc':
        products_qs = products_qs.order_by('-price')
    elif sort_by == 'name':
        products_qs = products_qs.order_by('name')
    elif sort_by == 'rating':
        # Annotate with average rating, fallback to name
        products_qs = products_qs.annotate(avg_rating=Avg('reviews__rating')).order_by('-avg_rating', 'name')
    else:
        # default: newest
        products_qs = products_qs.order_by('-created_at')

    # Pagination: 9 products per page
    paginator = Paginator(products_qs, 9)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Sidebar Filter Options (based on active/all database data)
    categories = Category.objects.filter(is_active=True)
    all_products = Product.objects.filter(is_active=True)
    
    # Get unique brand names
    brands = Brand.objects.filter(is_active=True)
    
    # Fetch user wishlist items to show saved markers
    wishlisted_product_ids = []
    if request.user.is_authenticated:
        wishlisted_product_ids = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)

    context = {
        'page_obj': page_obj,
        'categories': categories,
        'brands': brands,
        'active_category': active_category,
        'selected_category_slug': category_slug,
        'selected_brands': brand_slugs,
        'selected_price_tier': price_tier,
        'selected_deployments': deployments,
        'search_query': search_query,
        'sort_by': sort_by,
        'wishlisted_ids': wishlisted_product_ids,
        'compared_ids': request.session.get('compared_products', []),
        'deployment_options': ['Cloud / SaaS', 'On-Premise / Hardware', 'Hybrid']
    }
    return render(request, 'products/list.html', context)

def demo_selection(request):
    return render(request, 'products/demo_selection.html')

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    reviews = product.reviews.filter(is_approved=True)
    
    # Calculate review metrics
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
    reviews_count = reviews.count()
    
    # Stars distribution
    stars_dist = {i: 0 for i in range(1, 6)}
    for r in reviews:
        if 1 <= r.rating <= 5:
            stars_dist[r.rating] += 1
            
    # Calculate percentage for each star
    stars_pct = {}
    for star, count in stars_dist.items():
        stars_pct[star] = int((count / reviews_count) * 100) if reviews_count > 0 else 0

    # Related products: same category, exclude current
    related_products = Product.objects.filter(category=product.category, is_active=True).exclude(id=product.id)[:4]
    
    # Check if user already reviewed
    user_has_reviewed = False
    if request.user.is_authenticated:
        user_has_reviewed = reviews.filter(user=request.user).exists()

    # Check wishlist status
    is_wishlisted = False
    if request.user.is_authenticated:
        is_wishlisted = Wishlist.objects.filter(user=request.user, product=product).exists()

    context = {
        'product': product,
        'reviews': reviews,
        'avg_rating': avg_rating,
        'reviews_count': reviews_count,
        'stars_pct': stars_pct,
        'stars_dist': stars_dist,
        'related_products': related_products,
        'user_has_reviewed': user_has_reviewed,
        'is_wishlisted': is_wishlisted,
        'compared_ids': request.session.get('compared_products', [])
    }
    return render(request, 'products/detail.html', context)

@login_required
def submit_review(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    
    if request.method == 'POST':
        # Check if already reviewed
        existing_review = Review.objects.filter(product=product, user=request.user).first()
        if existing_review:
            messages.error(request, "You have already reviewed this product.")
            return redirect('product_detail', slug=product.slug)
            
        rating_str = request.POST.get('rating', '5')
        comment = request.POST.get('comment', '')
        
        try:
            rating = int(rating_str)
        except ValueError:
            rating = 5
            
        # Verify purchase (check if there is a delivered order containing this product)
        from orders.models import Order
        has_purchased = Order.objects.filter(
            user=request.user, 
            order_status='delivered', 
            items__product=product
        ).exists()
        
        Review.objects.create(
            product=product,
            user=request.user,
            rating=rating,
            comment=comment,
            is_approved=True, # Auto approve for simplicity, can toggle via admin panel
            is_verified_purchase=has_purchased
        )
        messages.success(request, "Thank you! Your product review has been submitted successfully.")
        
    return redirect('product_detail', slug=product.slug)

@login_required
def wishlist_add(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    Wishlist.objects.get_or_create(user=request.user, product=product)
    messages.success(request, f"Added {product.name} to your Wishlist.")
    
    next_url = request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('product_detail', slug=product.slug)

@login_required
def wishlist_remove(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    Wishlist.objects.filter(user=request.user, product=product).delete()
    messages.success(request, f"Removed {product.name} from your Wishlist.")
    
    next_url = request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('customer_dashboard')
