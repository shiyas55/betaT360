from django.db import models
from django.conf import settings
import uuid
from products.models import Product, Category, ProductVariant

class Coupon(models.Model):
    DISCOUNT_TYPES = (
        ('percentage', 'Percentage Discount (%)'),
        ('fixed', 'Fixed Amount Discount ($)'),
    )

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='percentage')
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(blank=True, null=True, help_text="Total overall times this coupon can be used")
    used_count = models.PositiveIntegerField(default=0)
    per_customer_limit = models.PositiveIntegerField(default=1, help_text="Usage limit per single customer")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.get_discount_type_display()} - {self.value})"

class Order(models.Model):
    ORDER_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('cod', 'Cash on Delivery'),
        ('bank_transfer', 'Bank Wire Transfer'),
        ('online', 'Online Payment Gateway'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refund_pending', 'Refund Pending'),
        ('refunded', 'Refunded'),
    )

    order_number = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='orders')
    
    # Statuses
    order_status = models.CharField(max_length=30, choices=ORDER_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='cod')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Financial breakdown
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Customer Info
    billing_address = models.JSONField(help_text="Snapshot of billing address parameters")
    shipping_address = models.JSONField(help_text="Snapshot of shipping address parameters")
    
    # Meta
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    customer_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number} - {self.get_order_status_display()}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Purchase unit price")
    plan = models.CharField(max_length=20, default='monthly')

    @property
    def item_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Deleted Product'} in Order {self.order.order_number}"


class Quotation(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('converted', 'Converted to Order'),
    )

    quotation_number = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='quotations')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    
    # Client Info Section
    client_name = models.CharField(max_length=255, blank=True, default='')
    contact_person = models.CharField(max_length=255, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    market_region = models.CharField(max_length=100, blank=True, default='')
    gstin_tax_id = models.CharField(max_length=100, blank=True, default='', verbose_name="GSTIN / Tax ID")
    
    currency = models.CharField(max_length=10, default='AED')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    overall_discount_val = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    overall_discount_type = models.CharField(max_length=20, choices=(('fixed', 'Fixed'), ('percentage', 'Percentage')), default='fixed')
    taxable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Tax GST / VAT")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Grand Total")
    
    billing_address = models.JSONField(help_text="Snapshot of billing address parameters", blank=True, null=True)
    shipping_address = models.JSONField(help_text="Snapshot of shipping address parameters", blank=True, null=True)
    
    admin_notes = models.TextField(blank=True, null=True, help_text="Internal notes not visible to the client")
    customer_notes = models.TextField(blank=True, null=True, help_text="Notes/Comments visible to customer")
    terms_conditions = models.TextField(blank=True, null=True, help_text="Terms and conditions visible on the quotation")
    valid_until = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='created_quotations')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Quotation {self.quotation_number} - {self.get_status_display()}"


class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, blank=True, null=True)
    product_name = models.CharField(max_length=255, blank=True, default='') # Fallback for custom product name
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, blank=True, null=True)
    variant_name = models.CharField(max_length=100, blank=True, default='')
    duration = models.CharField(max_length=50, default='monthly') # e.g. month, year, one-time, custom
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Quoted unit price")
    discount_type = models.CharField(max_length=20, choices=(('fixed', 'Fixed'), ('percentage', 'Percentage')), default='fixed')
    discount_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00) # qty * unit_price
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    final_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00) # taxable_amount + tax_amount

    def __str__(self):
        return f"{self.quantity} x {self.product_name or 'Custom Product'} in Quote {self.quotation.quotation_number}"


class QuotationAddOn(models.Model):
    quotation_item = models.ForeignKey(QuotationItem, on_delete=models.CASCADE, related_name='addons')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, blank=True, null=True)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"Add-on {self.name} for {self.quotation_item.product_name}"


class QuotationStatusHistory(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=50)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Quote {self.quotation.quotation_number} status to {self.status} at {self.created_at}"


class QuotationNote(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='notes_history')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    note_type = models.CharField(max_length=20, choices=(('internal', 'Internal Note'), ('client', 'Client Visible Note')), default='internal')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note by {self.author.username} on Quote {self.quotation.quotation_number}"


class QuotationPublicLink(models.Model):
    quotation = models.OneToOneField(Quotation, on_delete=models.CASCADE, related_name='public_link')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_active = models.BooleanField(default=True)
    view_count = models.PositiveIntegerField(default=0)
    last_viewed = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Public Link for Quote {self.quotation.quotation_number}"


class License(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
    )

    license_key = models.CharField(max_length=100, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='licenses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='licenses')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, blank=True, null=True, related_name='licenses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"License {self.license_key} for {self.product.name}"


class Subscription(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    )

    subscription_number = models.CharField(max_length=50, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='subscriptions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    plan_type = models.CharField(max_length=20, default='monthly') # monthly, yearly
    start_date = models.DateField()
    end_date = models.DateField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Subscription {self.subscription_number} - {self.product.name}"


class SupportTicket(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )

    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    ticket_number = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    messages = models.JSONField(default=list, blank=True, help_text="Conversation history logs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Ticket {self.ticket_number} - {self.subject}"


class ActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.created_at}"


class Template(models.Model):
    TYPE_CHOICES = (
        ('email', 'Email Template'),
        ('whatsapp', 'WhatsApp Template'),
        ('pdf', 'PDF Invoice/Quote Template'),
    )

    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    subject = models.CharField(max_length=255, blank=True, null=True)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
