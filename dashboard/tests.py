from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import json
import os

from products.models import Category, Brand, Product, SubBrand
from orders.models import Order

User = get_user_model()

class DashboardTestCase(TestCase):
    def setUp(self):
        # Create a product manager user
        self.mgr = User.objects.create_user(
            username='prod_mgr',
            email='pm@corporate.com',
            password='testpassword123',
            is_customer=False,
            is_product_manager=True
        )
        
        # Create a customer
        self.customer = User.objects.create_user(
            username='buyer',
            email='buyer@corporate.com',
            password='testpassword123',
            is_customer=True
        )

        self.category = Category.objects.create(name='Cloud Software', slug='cloud-software')
        self.brand = Brand.objects.create(name='Acme Corp', slug='acme-corp')
        
        self.product = Product.objects.create(
            name='Acme Cloud Storage',
            slug='acme-cloud-storage',
            sku='ACME-CS-001',
            category=self.category,
            brand=self.brand,
            price=20.00,
            list_price=20.00,
            purchase_price=10.00,
            stock_qty=10,
            deployment='Cloud / SaaS'
        )

        # Create a test order
        self.order = Order.objects.create(
            order_number='T360-TEST-123',
            user=self.customer,
            payment_method='cod',
            payment_status='pending',
            subtotal=1650.00,
            tax=297.00,
            shipping_cost=0.00,
            total=1947.00,
            shipping_address={'full_name': 'Test User', 'phone': '123', 'address_line1': 'Addr', 'city': 'City', 'state': 'State', 'postal_code': '123', 'country': 'US'},
            billing_address={'full_name': 'Test User', 'phone': '123', 'address_line1': 'Addr', 'city': 'City', 'state': 'State', 'postal_code': '123', 'country': 'US'}
        )

    def test_unauthenticated_manager_redirect(self):
        response = self.client.get(reverse('admin_home'))
        self.assertRedirects(response, reverse('admin_login'))

    def test_non_manager_access_denied(self):
        self.client.login(username='buyer', password='testpassword123')
        response = self.client.get(reverse('admin_home'))
        self.assertRedirects(response, reverse('home'))

    def test_manager_login_success(self):
        response = self.client.post(reverse('admin_login'), {
            'username': 'prod_mgr',
            'password': 'testpassword123'
        })
        self.assertRedirects(response, reverse('admin_home'))

    def test_admin_home_metrics(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        response = self.client.get(reverse('admin_home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'dashboard/home.html')
        self.assertEqual(response.context['total_products'], 1)
        self.assertEqual(response.context['total_orders'], 1)
        self.assertEqual(response.context['product_families_count'], 1)

    def test_product_crud_add(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Add Product POST
        response = self.client.post(reverse('admin_product_add'), {
            'name': 'New Testing Product',
            'sku': 'NEW-SKU-999',
            'category': self.category.id,
            'brand': self.brand.id,
            'list_price': '99.99',
            'purchase_price': '50.00',
            'currency': 'USD',
            'minimum_quantity': '1',
            'description': 'Description content',
            'publisher': 'Test Pub',
            'part_number': 'PN-123',
            'billing_cycle': 'Monthly',
            'term': '1 Year',
            'market': 'Commercial',
        })
        self.assertRedirects(response, reverse('admin_products'))
        self.assertTrue(Product.objects.filter(sku='NEW-SKU-999').exists())

    def test_product_crud_edit_delete(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Edit Product
        response = self.client.post(reverse('admin_product_edit', args=[self.product.id]), {
            'name': 'Acme Updated Storage',
            'sku': 'ACME-CS-001',
            'category': self.category.id,
            'brand': self.brand.id,
            'list_price': '25.00',
            'purchase_price': '12.00',
            'currency': 'USD',
            'minimum_quantity': '1',
            'description': 'Updated desc'
        })
        self.assertRedirects(response, reverse('admin_products'))
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Acme Updated Storage')
        self.assertEqual(self.product.list_price, Decimal('25.00'))

        # Delete Product via POST
        response = self.client.post(reverse('admin_product_delete', args=[self.product.id]))
        self.assertRedirects(response, reverse('admin_products'))
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())

    def test_order_status_update(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Update order status
        response = self.client.post(reverse('admin_order_status_update', args=[self.order.order_number]), {
            'status': 'processing'
        })
        self.assertRedirects(response, reverse('admin_order_detail', args=[self.order.order_number]))
        self.order.refresh_from_db()
        self.assertEqual(self.order.order_status, 'processing')

    def test_user_role_and_status_updates(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Edit user role and status
        response = self.client.post(reverse('admin_user_edit', args=[self.customer.id]), {
            'email': 'new_buyer@corporate.com',
            'first_name': 'BuyerFirst',
            'last_name': 'BuyerLast',
            'role': 'reseller',
            'company': 'New Corp',
            'phone': '999999',
            'is_active': 'on'
        })
        self.assertRedirects(response, reverse('admin_users'))
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.email, 'new_buyer@corporate.com')
        self.assertEqual(self.customer.user_type, 'reseller')
        self.assertTrue(self.customer.is_active)
        self.assertEqual(self.customer.profile.company_name, 'New Corp')

    def test_brands_crud(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Add Brand
        response = self.client.post(reverse('admin_brand_add'), {
            'name': 'New Brand Logo',
            'description': 'Brand desc',
            'is_featured': 'on'
        })
        self.assertRedirects(response, reverse('admin_brands'))
        self.assertTrue(Brand.objects.filter(name='New Brand Logo').exists())
        brand = Brand.objects.get(name='New Brand Logo')
        
        # Delete Brand
        response = self.client.post(reverse('admin_brand_delete', args=[brand.id]))
        self.assertRedirects(response, reverse('admin_brands'))
        self.assertFalse(Brand.objects.filter(name='New Brand Logo').exists())

    def test_sub_brands_crud(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Add Sub Brand
        response = self.client.post(reverse('admin_sub_brand_add'), {
            'brand': self.brand.id,
            'name': 'Cloud Engine'
        })
        self.assertRedirects(response, reverse('admin_sub_brands'))
        self.assertTrue(SubBrand.objects.filter(brand=self.brand, name='Cloud Engine').exists())
        sub_brand = SubBrand.objects.get(brand=self.brand, name='Cloud Engine')
        
        # Delete Sub Brand
        response = self.client.post(reverse('admin_sub_brand_delete', args=[sub_brand.id]))
        self.assertRedirects(response, reverse('admin_sub_brands'))
        self.assertFalse(SubBrand.objects.filter(brand=self.brand, name='Cloud Engine').exists())

    def test_settings_update(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Update settings
        response = self.client.post(reverse('admin_settings'), {
            'admin_email': 'support@techno360.com',
            'base_currency': 'INR',
            'shop_enabled': 'on',
            'cart_enabled': 'on',
            'checkout_enabled': 'on'
        })
        self.assertRedirects(response, reverse('admin_settings'))
        
        from dashboard.views import load_global_settings
        settings_data = load_global_settings()
        self.assertEqual(settings_data['admin_email'], 'support@techno360.com')
        self.assertEqual(settings_data['base_currency'], 'INR')
        self.assertTrue(settings_data['shop_enabled'])
        self.assertTrue(settings_data['cart_enabled'])
        self.assertTrue(settings_data['checkout_enabled'])

    def test_quotation_creation_and_calculation(self):
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # Post a new quotation with 1 item
        response = self.client.post(reverse('admin_quotation_add'), {
            'client_name': 'Corp Client Inc',
            'contact_person': 'Jane Doe',
            'email': 'jane@corpclient.com',
            'phone': '+971501234567',
            'market_region': 'Dubai Marina',
            'gstin_tax_id': 'TRN-999999',
            'currency': 'AED',
            'valid_days': '30',
            'overall_discount_val': '10.00',
            'overall_discount_type': 'percentage',
            'terms_conditions': 'Standard terms.',
            'admin_notes': 'Internal only',
            'customer_notes': 'For client eyes',
            'item_count': '1',
            # Item 1 fields
            'item_category_1': self.category.id,
            'item_product_1': self.product.id,
            'item_prod_name_1': 'Acme Cloud Storage',
            'item_qty_1': '5',
            'item_price_1': '100.00',
            'item_duration_1': 'monthly',
            'item_disc_val_1': '10.00',
            'item_disc_type_1': 'fixed',
            'item_tax_pct_1': '5.00',
        })
        self.assertRedirects(response, reverse('admin_quotations'))
        
        from orders.models import Quotation
        quote = Quotation.objects.get(client_name='Corp Client Inc')
        self.assertEqual(quote.status, 'draft')
        self.assertEqual(quote.currency, 'AED')
        
        # Verify maths:
        # subtotal: 5 * 100 = 500
        # item discount: 10
        # taxable amount before overall discount: 500 - 10 = 490
        # overall discount: 10% of subtotal (500) = 50
        # final taxable_amount: 500 - 10 - 50 = 440
        # item tax: 5% of taxable (500 - 10 = 490) = 24.50
        # total: 440 + 24.50 = 464.50
        self.assertEqual(quote.subtotal, Decimal('500.00'))
        self.assertEqual(quote.item_discount, Decimal('10.00'))
        self.assertEqual(quote.overall_discount_val, Decimal('10.00'))
        self.assertEqual(quote.taxable_amount, Decimal('440.00'))
        self.assertEqual(quote.tax, Decimal('24.50'))
        self.assertEqual(quote.total, Decimal('464.50'))

    def test_quotation_timeline_and_public_link(self):
        from orders.models import Quotation, QuotationPublicLink
        
        # Create quote programmatically
        quote = Quotation.objects.create(
            quotation_number='QT-2026-9999',
            client_name='Timeline Corp',
            email='timeline@corp.com',
            subtotal=100.00,
            total=105.00,
            status='draft'
        )
        # Ensure public link generated
        public_link, created = QuotationPublicLink.objects.get_or_create(quotation=quote)
        
        self.client.login(username='prod_mgr', password='testpassword123')
        
        # View detail (should transition/ensure public link exists)
        detail_url = reverse('admin_quotation_detail', args=[quote.quotation_number])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)
        
        # Update status view POST
        response = self.client.post(detail_url, {
            'update_status': '1',
            'status': 'sent',
            'status_notes': 'Sent to client representative.'
        })
        self.assertRedirects(response, detail_url)
        quote.refresh_from_db()
        self.assertEqual(quote.status, 'sent')
        self.assertEqual(quote.status_history.count(), 1)
        self.assertEqual(quote.status_history.first().notes, 'Sent to client representative.')

        # View as public client (transitions status from sent to viewed, increments counter)
        public_url = reverse('public_quotation_view', args=[public_link.token])
        response = self.client.get(public_url)
        self.assertEqual(response.status_code, 200)
        
        quote.refresh_from_db()
        public_link.refresh_from_db()
        self.assertEqual(quote.status, 'viewed')
        self.assertEqual(public_link.view_count, 1)

        # Public Client action Accept
        response = self.client.post(public_url, {
            'client_action': 'accept',
            'feedback_notes': 'Approved by CIO.'
        })
        self.assertRedirects(response, public_url)
        quote.refresh_from_db()
        self.assertEqual(quote.status, 'accepted')
        
        # Convert to order by manager
        convert_url = reverse('admin_quotation_convert_order', args=[quote.id])
        response = self.client.post(convert_url)
        messages_list = list(response.wsgi_request._messages)
        print("MESSAGES FOR CONVERT:", [m.message for m in messages_list])
        
        quote.refresh_from_db()
        self.assertEqual(quote.status, 'converted')
        
        from orders.models import Order
        order = Order.objects.get(user__email='timeline@corp.com')
        self.assertEqual(order.subtotal, quote.subtotal)
        self.assertEqual(order.total, quote.total)
