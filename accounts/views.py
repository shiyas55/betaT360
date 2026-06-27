from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate, get_user_model, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpResponse, Http404
from django.core.paginator import Paginator
from django.utils import timezone
from decimal import Decimal
from .models import Profile, Address
from products.models import Product, Wishlist
from orders.models import Order, OrderItem, Quotation, QuotationItem, License, Subscription, SupportTicket, Notification, ActivityLog

User = get_user_model()

def login_view(request):
    if request.user.is_authenticated:
        if request.user.is_staff or request.user.is_product_manager or request.user.is_order_manager or request.user.is_sales_manager:
            return redirect('admin_home')
        return redirect('customer_dashboard')
        
    if request.method == 'POST':
        login_id = request.POST.get('username')
        password = request.POST.get('password')
        
        # B2B support: look up by email or username
        username = login_id
        if '@' in login_id:
            user_obj = User.objects.filter(email=login_id).first()
            if user_obj:
                username = user_obj.username
                
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if not user.is_active:
                messages.error(request, "Your account has been deactivated. Please contact support.")
                return render(request, 'accounts/login.html')
                
            login(request, user)
            messages.success(request, f"Welcome back, {user.first_name or user.username}!")
            
            # Merge session guest cart if there is one
            guest_cart = request.session.get('cart', {})
            if guest_cart:
                from cart.cart import Cart
                cart = Cart(request)
                cart.merge_guest_cart(guest_cart)
                
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)
                
            if user.is_staff or user.is_product_manager or user.is_order_manager or user.is_sales_manager:
                return redirect('admin_home')
            return redirect('customer_dashboard')
        else:
            messages.error(request, "Invalid corporate email/username or password.")
            
    return render(request, 'accounts/login.html')

def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('home')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('customer_dashboard')
        
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        company_name = request.POST.get('company_name')
        phone_number = request.POST.get('phone_number')
        
        # Simple validations
        if not username or not email or not password:
            messages.error(request, "Please fill in all required fields.")
            return render(request, 'accounts/register.html')
            
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username is already registered.")
            return render(request, 'accounts/register.html')
            
        if User.objects.filter(email=email).exists():
            messages.error(request, "Corporate email is already registered.")
            return render(request, 'accounts/register.html')
            
        try:
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_customer=True
            )
            # Update Profile
            profile = user.profile
            profile.company_name = company_name
            profile.phone_number = phone_number
            profile.save()
            
            # Log user in
            login(request, user)
            messages.success(request, "Registration successful! Welcome to your corporate dashboard.")
            return redirect('customer_dashboard')
        except IntegrityError:
            messages.error(request, "An error occurred. Please try again.")
            
    return render(request, 'accounts/register.html')

@login_required
def customer_dashboard(request):
    user = request.user
    
    # B2B Stats Cards
    total_orders = Order.objects.filter(user=user).count()
    active_quotes = Quotation.objects.filter(user=user, status__in=['draft', 'sent', 'accepted']).count()
    active_licenses = License.objects.filter(user=user, status='active').count()
    active_subs = Subscription.objects.filter(user=user, status='active').count()
    pending_payments = Order.objects.filter(user=user, payment_status='pending').count()
    open_tickets = SupportTicket.objects.filter(user=user, status__in=['open', 'in_progress']).count()
    
    # Lists
    recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
    recent_quotes = Quotation.objects.filter(user=user).order_by('-created_at')[:5]
    sub_renewals = Subscription.objects.filter(user=user, status='active').order_by('end_date')[:5]
    
    # Licence expiry alerts: active licences expiring in next 30 days
    thirty_days_hence = timezone.now() + timezone.timedelta(days=30)
    licence_alerts = License.objects.filter(
        user=user, 
        status='active', 
        expires_at__lte=thirty_days_hence
    ).order_by('expires_at')[:5]
    
    recent_notifications = Notification.objects.filter(user=user, is_read=False).order_by('-created_at')[:5]
    
    # Recommended Products
    recommended_products = Product.objects.filter(is_active=True, is_featured=True)[:4]
    
    context = {
        'total_orders': total_orders,
        'active_quotes': active_quotes,
        'active_licenses': active_licenses,
        'active_subs': active_subs,
        'pending_payments': pending_payments,
        'open_tickets': open_tickets,
        'recent_orders': recent_orders,
        'recent_quotes': recent_quotes,
        'sub_renewals': sub_renewals,
        'licence_alerts': licence_alerts,
        'recent_notifications': recent_notifications,
        'recommended_products': recommended_products,
    }
    return render(request, 'accounts/dashboard.html', context)


@login_required
def customer_profile(request):
    user = request.user
    profile = user.profile
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'profile_info':
            user.first_name = request.POST.get('first_name')
            user.last_name = request.POST.get('last_name')
            user.email = request.POST.get('email')
            user.save()
            
            profile.company_name = request.POST.get('company_name')
            profile.phone_number = request.POST.get('phone_number')
            profile.tax_id = request.POST.get('tax_id')
            
            if 'profile_image' in request.FILES:
                profile.profile_image = request.FILES['profile_image']
                
            profile.save()
            messages.success(request, "Profile details updated successfully.")
            
        elif action == 'change_password':
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')
            
            if password == confirm_password:
                user.set_password(password)
                user.save()
                update_session_auth_hash(request, user)
                messages.success(request, "Password updated successfully.")
            else:
                messages.error(request, "Passwords do not match.")
                
        elif action == 'notification_preferences':
            email_notif = request.POST.get('email_notifications') == 'on'
            whatsapp_notif = request.POST.get('whatsapp_notifications') == 'on'
            promo_notif = request.POST.get('promotional_notifications') == 'on'
            
            profile.notification_preferences = {
                'email': email_notif,
                'whatsapp': whatsapp_notif,
                'promotional': promo_notif
            }
            profile.save()
            messages.success(request, "Notification preferences saved.")
            
        return redirect('customer_profile')
        
    context = {
        'profile': profile,
        'user': user
    }
    return render(request, 'accounts/profile.html', context)


@login_required
def profile_edit(request):
    if request.method == 'POST':
        user = request.user
        profile = user.profile
        
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        user.save()
        
        profile.company_name = request.POST.get('company_name', profile.company_name)
        profile.phone_number = request.POST.get('phone_number', profile.phone_number)
        profile.save()
        
        messages.success(request, "Profile updated successfully.")
        return redirect('customer_dashboard')
        
    return redirect('customer_profile')


@login_required
def customer_addresses(request):
    addresses = Address.objects.filter(user=request.user)
    context = {
        'addresses': addresses
    }
    return render(request, 'accounts/addresses.html', context)


@login_required
def address_add(request):
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        phone = request.POST.get('phone')
        address_line1 = request.POST.get('address_line1')
        address_line2 = request.POST.get('address_line2')
        city = request.POST.get('city')
        district = request.POST.get('district')
        state = request.POST.get('state')
        postal_code = request.POST.get('postal_code')
        address_type = request.POST.get('address_type', 'shipping')
        address_label = request.POST.get('address_label', 'Office')
        is_default = request.POST.get('is_default') == 'true' or request.POST.get('is_default') == 'on'
        
        if not full_name or not phone or not address_line1 or not city or not state or not postal_code:
            messages.error(request, "Please fill in all required address fields.")
        else:
            Address.objects.create(
                user=request.user,
                full_name=full_name,
                phone=phone,
                address_line1=address_line1,
                address_line2=address_line2,
                city=city,
                district=district,
                state=state,
                postal_code=postal_code,
                address_type=address_type,
                address_label=address_label,
                is_default=is_default
            )
            messages.success(request, "Address added successfully.")
            
    next_url = request.POST.get('next') or request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('customer_dashboard')


@login_required
def address_edit(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    if request.method == 'POST':
        address.full_name = request.POST.get('full_name', address.full_name)
        address.phone = request.POST.get('phone', address.phone)
        address.address_line1 = request.POST.get('address_line1', address.address_line1)
        address.address_line2 = request.POST.get('address_line2', address.address_line2)
        address.city = request.POST.get('city', address.city)
        address.district = request.POST.get('district', address.district)
        address.state = request.POST.get('state', address.state)
        address.postal_code = request.POST.get('postal_code', address.postal_code)
        address.address_type = request.POST.get('address_type', address.address_type)
        address.address_label = request.POST.get('address_label', address.address_label)
        address.is_default = request.POST.get('is_default') == 'true' or request.POST.get('is_default') == 'on'
        
        address.save()
        messages.success(request, "Address updated successfully.")
        
    next_url = request.POST.get('next') or request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('customer_dashboard')


@login_required
def address_delete(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    address.delete()
    messages.success(request, "Address deleted successfully.")
    
    next_url = request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('customer_dashboard')


@login_required
def customer_orders(request):
    query = request.GET.get('search', '')
    status = request.GET.get('status', '')
    
    orders = Order.objects.filter(user=request.user)
    if query:
        orders = orders.filter(order_number__icontains=query)
    if status:
        orders = orders.filter(order_status=status)
        
    paginator = Paginator(orders, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': query,
        'status_filter': status,
        'order_statuses': Order.ORDER_STATUS_CHOICES
    }
    return render(request, 'accounts/orders.html', context)


@login_required
def customer_order_detail(request, order_number):
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    context = {
        'order': order
    }
    return render(request, 'accounts/order_detail.html', context)


@login_required
def customer_order_cancel(request, order_number):
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    if order.order_status == 'pending':
        order.order_status = 'cancelled'
        order.save()
        messages.success(request, f"Order {order_number} has been cancelled successfully.")
        
        # Log Activity
        ActivityLog.objects.create(
            user=request.user,
            action="Order Cancelled",
            details=f"Cancelled order {order_number}"
        )
    else:
        messages.error(request, "This order is no longer eligible for cancellation.")
    return redirect('customer_order_detail', order_number=order_number)


@login_required
def customer_order_refund_request(request, order_number):
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    if order.payment_status == 'paid' and order.order_status in ['confirmed', 'processing', 'delivered']:
        order.payment_status = 'refund_pending'
        order.save()
        messages.success(request, f"Refund request for order {order_number} submitted and is being processed.")
        
        # Log Activity
        ActivityLog.objects.create(
            user=request.user,
            action="Refund Requested",
            details=f"Requested refund for order {order_number}"
        )
        
        # Notify
        Notification.objects.create(
            user=request.user,
            title="Refund Pending",
            message=f"Your refund request for order {order_number} is pending approval."
        )
    else:
        messages.error(request, "This order is not eligible for refund.")
    return redirect('customer_order_detail', order_number=order_number)


@login_required
def customer_reorder(request, order_number):
    # Retrieve order items and inject into cart
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    from cart.cart import Cart
    cart = Cart(request)
    
    reordered_count = 0
    for item in order.items.all():
        if item.product and item.product.is_active:
            cart.add(product=item.product, quantity=item.quantity, plan=item.plan)
            reordered_count += 1
            
    if reordered_count > 0:
        messages.success(request, f"Added items from Order {order_number} back to your cart.")
        return redirect('cart_detail')
    else:
        messages.error(request, "No products from this order could be reordered.")
        return redirect('customer_orders')


@login_required
def customer_quotations(request):
    query = request.GET.get('search', '')
    status = request.GET.get('status', '')
    
    quotes = Quotation.objects.filter(user=request.user)
    if query:
        quotes = quotes.filter(quotation_number__icontains=query)
    if status:
        quotes = quotes.filter(status=status)
        
    paginator = Paginator(quotes, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': query,
        'status_filter': status,
        'quote_statuses': Quotation.STATUS_CHOICES
    }
    return render(request, 'accounts/quotations.html', context)


@login_required
def customer_quotation_detail(request, quotation_number):
    quote = get_object_or_404(Quotation, quotation_number=quotation_number, user=request.user)
    context = {
        'quote': quote
    }
    return render(request, 'accounts/quotation_detail.html', context)


@login_required
def customer_quotation_accept(request, quotation_number):
    quote = get_object_or_404(Quotation, quotation_number=quotation_number, user=request.user)
    if quote.status == 'sent':
        quote.status = 'accepted'
        quote.save()
        messages.success(request, f"Quotation {quotation_number} accepted. You can now convert it to an order.")
        
        # Log Activity
        ActivityLog.objects.create(
            user=request.user,
            action="Quotation Accepted",
            details=f"Accepted quotation {quotation_number}"
        )
    else:
        messages.error(request, "Invalid quotation state.")
    return redirect('customer_quotation_detail', quotation_number=quotation_number)


@login_required
def customer_quotation_reject(request, quotation_number):
    quote = get_object_or_404(Quotation, quotation_number=quotation_number, user=request.user)
    if quote.status == 'sent':
        quote.status = 'rejected'
        quote.save()
        messages.success(request, f"Quotation {quotation_number} has been rejected.")
        
        # Log Activity
        ActivityLog.objects.create(
            user=request.user,
            action="Quotation Rejected",
            details=f"Rejected quotation {quotation_number}"
        )
    else:
        messages.error(request, "Invalid quotation state.")
    return redirect('customer_quotation_detail', quotation_number=quotation_number)


@login_required
def customer_quotation_convert(request, quotation_number):
    quote = get_object_or_404(Quotation, quotation_number=quotation_number, user=request.user)
    if quote.status == 'accepted':
        # Create Order from Quotation
        import uuid
        import random
        order_no = f"ORD-{timezone.now().strftime('%y%m%d')}-{random.randint(1000, 9999)}"
        
        billing = quote.billing_address or {}
        shipping = quote.shipping_address or {}
        
        # Recalculate discount
        overall_disc = quote.overall_discount_val
        if quote.overall_discount_type == 'percentage':
            overall_disc = quote.subtotal * (quote.overall_discount_val / Decimal('100.00'))
        total_discount = quote.item_discount + overall_disc

        if not billing:
            billing = {'full_name': quote.client_name, 'phone': quote.phone, 'address_line1': quote.market_region, 'city': 'N/A', 'state': 'N/A', 'postal_code': 'N/A', 'country': 'N/A'}
        if not shipping:
            shipping = {'full_name': quote.client_name, 'phone': quote.phone, 'address_line1': quote.market_region, 'city': 'N/A', 'state': 'N/A', 'postal_code': 'N/A', 'country': 'N/A'}

        order = Order.objects.create(
            order_number=order_no,
            user=request.user,
            order_status='pending',
            payment_method='bank_transfer',
            payment_status='pending',
            subtotal=quote.subtotal,
            discount=total_discount,
            tax=quote.tax,
            shipping_cost=Decimal('0.00'),
            total=quote.total,
            billing_address=billing,
            shipping_address=shipping,
            customer_notes=f"Converted from quote {quotation_number}."
        )
        
        for q_item in quote.items.all():
            OrderItem.objects.create(
                order=order,
                product=q_item.product,
                quantity=q_item.quantity,
                price=q_item.price,
                plan=q_item.duration
            )
            
        quote.status = 'converted'
        quote.save()
        
        messages.success(request, f"Quotation successfully converted to Order {order_no}!")
        
        # Log Activity
        ActivityLog.objects.create(
            user=request.user,
            action="Quote Converted to Order",
            details=f"Converted quote {quotation_number} to order {order_no}"
        )
        
        return redirect('customer_order_detail', order_number=order_no)
    else:
        messages.error(request, "Only accepted quotations can be converted to orders.")
        return redirect('customer_quotation_detail', quotation_number=quotation_number)


@login_required
def customer_quotation_pdf(request, quotation_number):
    # Generates a mock printable HTML/text representation for pdf download
    quote = get_object_or_404(Quotation, quotation_number=quotation_number, user=request.user)
    
    html = f"""
    <html>
    <head>
        <title>Quote {quote.quotation_number}</title>
        <style>
            body {{ font-family: sans-serif; padding: 40px; color: #333; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #ccc; padding-bottom: 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #0f172a; }}
            .details {{ margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
            .table {{ width: 100%; border-collapse: collapse; margin-top: 30px; }}
            .table th, .table td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
            .table th {{ background-color: #f1f5f9; }}
            .totals {{ margin-top: 30px; text-align: right; font-size: 16px; }}
        </style>
    </head>
    <body onload="window.print()">
        <div class='header'>
            <div class='logo'>TECHNOSTORE360</div>
            <div>
                <strong>Quotation:</strong> {quote.quotation_number}<br/>
                <strong>Date:</strong> {quote.created_at.strftime('%Y-%m-%d')}<br/>
                <strong>Valid Until:</strong> {quote.valid_until.strftime('%Y-%m-%d') if quote.valid_until else 'N/A'}<br/>
                <strong>Status:</strong> {quote.get_status_display()}
            </div>
        </div>
        <div class='details'>
            <div>
                <strong>Client Details:</strong><br/>
                {quote.client_name}<br/>
                {quote.contact_person or ''}<br/>
                Email: {quote.email}<br/>
                Phone: {quote.phone or 'N/A'}<br/>
                Tax ID/GST: {quote.gstin_tax_id or 'N/A'}
            </div>
            <div>
                <strong>Shipping Address:</strong><br/>
                {quote.shipping_address.get('full_name', '') if quote.shipping_address else ''}<br/>
                {quote.shipping_address.get('address_line1', '') if quote.shipping_address else ''}<br/>
                {quote.shipping_address.get('city', '') if quote.shipping_address else ''}, {quote.shipping_address.get('state', '') if quote.shipping_address else ''} - {quote.shipping_address.get('postal_code', '') if quote.shipping_address else ''}
            </div>
        </div>
        
        <table class='table'>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Billing Cycle</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    """
    for item in quote.items.all():
        html += f"""
                <tr>
                    <td>{item.product.name if item.product else item.product_name}</td>
                    <td style="text-transform: capitalize;">{item.duration}</td>
                    <td>{quote.currency} {item.price}</td>
                    <td>{item.quantity}</td>
                    <td>{quote.currency} {item.final_total}</td>
                </tr>
        """
    html += f"""
            </tbody>
        </table>
        
        <div class='totals'>
            Subtotal: {quote.currency} {quote.subtotal}<br/>
            Tax: {quote.currency} {quote.tax}<br/>
            <strong>Grand Total: {quote.currency} {quote.total}</strong>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)


@login_required
def customer_wishlist(request):
    wishlisted = Wishlist.objects.filter(user=request.user)
    context = {
        'wishlist': wishlisted
    }
    return render(request, 'accounts/wishlist.html', context)


@login_required
def customer_compare(request):
    # Simply redirects to primary storefront comparison page
    return redirect('product_compare')


@login_required
def customer_licenses(request):
    licenses = License.objects.filter(user=request.user)
    context = {
        'licenses': licenses
    }
    return render(request, 'accounts/licenses.html', context)


@login_required
def customer_subscriptions(request):
    subscriptions = Subscription.objects.filter(user=request.user)
    context = {
        'subscriptions': subscriptions
    }
    return render(request, 'accounts/subscriptions.html', context)


@login_required
def customer_tickets(request):
    tickets = SupportTicket.objects.filter(user=request.user)
    context = {
        'tickets': tickets
    }
    return render(request, 'accounts/tickets.html', context)


@login_required
def customer_ticket_create(request):
    if request.method == 'POST':
        subject = request.POST.get('subject')
        description = request.POST.get('description')
        priority = request.POST.get('priority', 'medium')
        
        if not subject or not description:
            messages.error(request, "Please fill in all ticket details.")
        else:
            ticket_no = f"TCK-{timezone.now().year}-{random.randint(1000, 9999)}"
            SupportTicket.objects.create(
                ticket_number=ticket_no,
                user=request.user,
                subject=subject,
                description=description,
                priority=priority,
                messages=[
                    {
                        'sender': request.user.username,
                        'message': description,
                        'timestamp': timezone.now().isoformat()
                    }
                ]
            )
            messages.success(request, f"Support ticket {ticket_no} created successfully.")
    return redirect('customer_tickets')


@login_required
def customer_ticket_detail(request, ticket_number):
    ticket = get_object_or_404(SupportTicket, ticket_number=ticket_number, user=request.user)
    
    if request.method == 'POST':
        message_text = request.POST.get('message')
        if message_text:
            msg_list = list(ticket.messages)
            msg_list.append({
                'sender': request.user.username,
                'message': message_text,
                'timestamp': timezone.now().isoformat()
            })
            ticket.messages = msg_list
            ticket.status = 'open' # reopen or keep open
            ticket.save()
            messages.success(request, "Reply submitted successfully.")
            return redirect('customer_ticket_detail', ticket_number=ticket_number)
            
    context = {
        'ticket': ticket
    }
    return render(request, 'accounts/ticket_detail.html', context)


@login_required
def customer_notifications(request):
    notifications = Notification.objects.filter(user=request.user)
    
    # Mark read on loading
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    
    context = {
        'notifications': notifications
    }
    return render(request, 'accounts/notifications.html', context)


@login_required
def customer_notification_read(request, notification_id):
    notif = get_object_or_404(Notification, id=notification_id, user=request.user)
    notif.is_read = True
    notif.save()
    return redirect('customer_notifications')


@login_required
def customer_settings(request):
    return render(request, 'accounts/settings.html')


@login_required
def wallet_view(request):
    return render(request, 'accounts/wallet.html')

@login_required
def referrals_view(request):
    return render(request, 'accounts/referrals.html')
