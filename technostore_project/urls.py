from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# Import views
from core import views as core_views
from accounts import views as accounts_views
from products import views as products_views
from cart import views as cart_views
from orders import views as orders_views
from dashboard import views as dashboard_views
from products import api_views as products_api_views

urlpatterns = [
    # API endpoints
    path('api/products/', products_api_views.ProductListAPIView.as_view(), name='api_product_list'),
    path('api/products/<slug:slug>/', products_api_views.ProductDetailAPIView.as_view(), name='api_product_detail'),
    # Built-in django admin (fallback)
    path('admin-console/', admin.site.urls),

    # App: core (landing pages)
    path('', core_views.home, name='home'),
    path('packages/', core_views.solution_packages, name='solution_packages'),
    path('compare/', core_views.product_compare, name='product_compare'),
    path('demo/', core_views.demo_request, name='demo_request'),
    path('vendors/', core_views.reseller_dashboard, name='reseller_dashboard'),

    # App: accounts (SSO / Profiles / Dashboard)
    path('accounts/login/', accounts_views.login_view, name='login'),
    path('accounts/logout/', accounts_views.logout_view, name='logout'),
    path('accounts/register/', accounts_views.register_view, name='register'),
    path('accounts/dashboard/', accounts_views.customer_dashboard, name='customer_dashboard'),
    path('accounts/profile/', accounts_views.customer_profile, name='customer_profile'),
    path('accounts/profile/edit/', accounts_views.profile_edit, name='profile_edit'),
    path('accounts/addresses/', accounts_views.customer_addresses, name='customer_addresses'),
    path('accounts/address/add/', accounts_views.address_add, name='address_add'),
    path('accounts/address/edit/<int:address_id>/', accounts_views.address_edit, name='address_edit'),
    path('accounts/address/delete/<int:address_id>/', accounts_views.address_delete, name='address_delete'),
    path('accounts/orders/', accounts_views.customer_orders, name='customer_orders'),
    path('accounts/orders/<str:order_number>/', accounts_views.customer_order_detail, name='customer_order_detail'),
    path('accounts/orders/<str:order_number>/cancel/', accounts_views.customer_order_cancel, name='customer_order_cancel'),
    path('accounts/orders/<str:order_number>/refund/', accounts_views.customer_order_refund_request, name='customer_order_refund_request'),
    path('accounts/orders/<str:order_number>/reorder/', accounts_views.customer_reorder, name='customer_reorder'),
    path('accounts/quotations/', accounts_views.customer_quotations, name='customer_quotations'),
    path('accounts/quotations/<str:quotation_number>/', accounts_views.customer_quotation_detail, name='customer_quotation_detail'),
    path('accounts/quotations/<str:quotation_number>/accept/', accounts_views.customer_quotation_accept, name='customer_quotation_accept'),
    path('accounts/quotations/<str:quotation_number>/reject/', accounts_views.customer_quotation_reject, name='customer_quotation_reject'),
    path('accounts/quotations/<str:quotation_number>/convert/', accounts_views.customer_quotation_convert, name='customer_quotation_convert'),
    path('accounts/quotations/<str:quotation_number>/pdf/', accounts_views.customer_quotation_pdf, name='customer_quotation_pdf'),
    path('accounts/wishlist/', accounts_views.customer_wishlist, name='customer_wishlist'),
    path('accounts/compare/', accounts_views.customer_compare, name='customer_compare'),
    path('accounts/licenses/', accounts_views.customer_licenses, name='customer_licenses'),
    path('accounts/subscriptions/', accounts_views.customer_subscriptions, name='customer_subscriptions'),
    path('accounts/tickets/', accounts_views.customer_tickets, name='customer_tickets'),
    path('accounts/tickets/create/', accounts_views.customer_ticket_create, name='customer_ticket_create'),
    path('accounts/tickets/<str:ticket_number>/', accounts_views.customer_ticket_detail, name='customer_ticket_detail'),
    path('accounts/notifications/', accounts_views.customer_notifications, name='customer_notifications'),
    path('accounts/notifications/<int:notification_id>/read/', accounts_views.customer_notification_read, name='customer_notification_read'),
    path('accounts/settings/', accounts_views.customer_settings, name='customer_settings'),
    path('accounts/wallet/', accounts_views.wallet_view, name='customer_wallet'),
    path('accounts/referrals/', accounts_views.referrals_view, name='customer_referrals'),

    # App: products (catalog & details)
    path('products/', products_views.product_list, name='product_list'),
    path('products/demo-selection/', products_views.demo_selection, name='demo_selection'),
    path('products/<slug:slug>/', products_views.product_detail, name='product_detail'),
    path('products/<slug:slug>/review/', products_views.submit_review, name='submit_review'),
    path('wishlist/add/<int:product_id>/', products_views.wishlist_add, name='wishlist_add'),
    path('wishlist/remove/<int:product_id>/', products_views.wishlist_remove, name='wishlist_remove'),

    # App: cart (session operations)
    path('cart/', cart_views.cart_detail, name='cart_detail'),
    path('cart/add/<int:product_id>/', cart_views.cart_add, name='cart_add'),
    path('cart/update/<int:product_id>/', cart_views.cart_update, name='cart_update'),
    path('cart/remove/<int:product_id>/', cart_views.cart_remove, name='cart_remove'),
    path('cart/clear/', cart_views.cart_clear, name='cart_clear'),

    # App: orders (checkout & invoices)
    path('checkout/', orders_views.checkout, name='checkout'),
    path('checkout/coupon/', orders_views.coupon_apply, name='coupon_apply'),
    path('checkout/confirmation/<str:order_number>/', orders_views.order_confirmation, name='order_confirmation'),
    path('order/detail/<str:order_number>/', orders_views.order_detail, name='order_detail'),
    path('order/invoice/<str:order_number>/', orders_views.order_invoice, name='order_invoice'),
    path('order/cancel/<str:order_number>/', orders_views.order_cancel, name='order_cancel'),

    # App: dashboard (Custom admin desk)
    path('dashboard/', dashboard_views.admin_home, name='admin_home'),
    path('dashboard/login/', dashboard_views.admin_login, name='admin_login'),
    path('dashboard/logout/', dashboard_views.admin_logout, name='admin_logout'),
    # Users Management
    path('dashboard/users/', dashboard_views.admin_users, name='admin_users'),
    path('dashboard/users/edit/<int:user_id>/', dashboard_views.admin_user_edit, name='admin_user_edit'),
    path('dashboard/users/delete/<int:user_id>/', dashboard_views.admin_user_delete, name='admin_user_delete'),
    # Products Management
    path('dashboard/products/', dashboard_views.admin_products, name='admin_products'),
    path('dashboard/products/add/', dashboard_views.admin_product_add, name='admin_product_add'),
    path('dashboard/products/edit/<int:product_id>/', dashboard_views.admin_product_edit, name='admin_product_edit'),
    path('dashboard/products/delete/<int:product_id>/', dashboard_views.admin_product_delete, name='admin_product_delete'),
    # Brands Management
    path('dashboard/brands/', dashboard_views.admin_brands, name='admin_brands'),
    path('dashboard/brands/add/', dashboard_views.admin_brand_add, name='admin_brand_add'),
    path('dashboard/brands/delete/<int:brand_id>/', dashboard_views.admin_brand_delete, name='admin_brand_delete'),
    # Sub Brands Management
    path('dashboard/sub_brands/', dashboard_views.admin_sub_brands, name='admin_sub_brands'),
    path('dashboard/sub_brands/add/', dashboard_views.admin_sub_brand_add, name='admin_sub_brand_add'),
    path('dashboard/sub_brands/delete/<int:sub_brand_id>/', dashboard_views.admin_sub_brand_delete, name='admin_sub_brand_delete'),
    # Sales/Order Management
    path('dashboard/orders/', dashboard_views.admin_orders, name='admin_orders'),
    path('dashboard/orders/<str:order_number>/', dashboard_views.admin_order_detail, name='admin_order_detail'),
    path('dashboard/orders/<str:order_number>/status/', dashboard_views.admin_order_status_update, name='admin_order_status_update'),
    # Settings Management
    path('dashboard/settings/', dashboard_views.admin_settings, name='admin_settings'),
    path('dashboard/wallet/', dashboard_views.admin_wallet_view, name='admin_wallet'),
    path('dashboard/transactions/', dashboard_views.admin_transactions_view, name='admin_transactions'),
    path('dashboard/withdrawals/', dashboard_views.admin_withdrawals_view, name='admin_withdrawals'),
    path('dashboard/referrals/', dashboard_views.admin_referrals_view, name='admin_referrals'),
    # Quotations Management
    path('dashboard/quotations/', dashboard_views.admin_quotations, name='admin_quotations'),
    path('dashboard/quotations/add/', dashboard_views.admin_quotation_add, name='admin_quotation_add'),
    path('dashboard/quotations/edit/<int:quotation_id>/', dashboard_views.admin_quotation_edit, name='admin_quotation_edit'),
    path('dashboard/quotations/duplicate/<int:quotation_id>/', dashboard_views.admin_quotation_duplicate, name='admin_quotation_duplicate'),
    path('dashboard/quotations/convert/<int:quotation_id>/', dashboard_views.admin_quotation_convert_order, name='admin_quotation_convert_order'),
    path('dashboard/quotations/pdf/<str:quotation_number>/', dashboard_views.admin_quotation_pdf, name='admin_quotation_pdf'),
    path('dashboard/quotations/<str:quotation_number>/', dashboard_views.admin_quotation_detail, name='admin_quotation_detail'),
    path('dashboard/quotations/delete/<int:quotation_id>/', dashboard_views.admin_quotation_delete, name='admin_quotation_delete'),
    path('quotation/shared/<uuid:token>/', dashboard_views.public_quotation_view, name='public_quotation_view'),
    path('dashboard/ajax/products/', dashboard_views.ajax_get_products_by_category, name='ajax_get_products_by_category'),
    path('dashboard/ajax/variants/', dashboard_views.ajax_get_variants_by_product, name='ajax_get_variants_by_product'),
    path('dashboard/ajax/client-details/', dashboard_views.ajax_get_client_details, name='ajax_get_client_details'),
]

# Media and Static files routing during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
