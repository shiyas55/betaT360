from django.db import models
from django.utils.text import slugify
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, default='layers', help_text='Lucide icon name')
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class SubBrand(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='sub_brands')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ('brand', 'name')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.brand.slug}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.brand.name} - {self.name}"

class Product(models.Model):
    STOCK_STATUS_CHOICES = (
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
    )

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    sku = models.CharField(max_length=50, unique=True, verbose_name="SKU / Product Code")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    sub_brand = models.ForeignKey(SubBrand, on_delete=models.SET_NULL, blank=True, null=True, related_name='products')
    short_desc = models.TextField(max_length=500, blank=True, null=True)
    full_desc = models.TextField(blank=True, null=True)
    
    # Images
    image = models.CharField(max_length=500, blank=True, null=True, help_text="Path to static image or URL")
    image_file = models.ImageField(upload_to='products/', blank=True, null=True, help_text="Uploaded file")
    
    # Pricing & Additional metadata fields
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Regular Price")
    list_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='INR')
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, verbose_name="Sale Price")
    discount_percent = models.PositiveIntegerField(default=0)
    
    # Extra prompt fields
    publisher = models.CharField(max_length=255, blank=True, default='')
    part_number = models.CharField(max_length=100, blank=True, default='')
    billing_cycle = models.CharField(max_length=100, blank=True, default='')
    term = models.CharField(max_length=100, blank=True, default='')
    market = models.CharField(max_length=100, blank=True, default='')
    purchase_unit = models.CharField(max_length=100, blank=True, default='')
    minimum_quantity = models.IntegerField(default=1)
    maximum_quantity = models.IntegerField(blank=True, null=True)
    
    # Read-only attributes stored in DB
    catalog_key = models.CharField(max_length=100, blank=True, default='')
    segment = models.CharField(max_length=100, blank=True, default='')
    agreement = models.CharField(max_length=100, blank=True, default='')
    region = models.CharField(max_length=100, blank=True, default='')
    
    # Inventory
    stock_qty = models.IntegerField(default=0)
    low_stock_level = models.IntegerField(default=5)
    
    # Flags
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    
    # Specifications
    deployment = models.CharField(max_length=100, default='Cloud / SaaS')
    business_type = models.CharField(max_length=100, default='Enterprise & Mid-Market')
    support = models.CharField(max_length=100, default='24/7 Live Support')
    best_use_case = models.TextField(blank=True, null=True)
    demo_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if self.list_price == 0.00 and self.price > 0.00:
            self.list_price = self.price
        else:
            self.price = self.list_price
        if self.sale_price and self.price > 0:
            self.discount_percent = int(((self.price - self.sale_price) / self.price) * 100)
        else:
            self.discount_percent = 0
        super().save(*args, **kwargs)

    @property
    def current_price(self):
        return self.sale_price if self.sale_price is not None else self.price

    @property
    def price_in_inr(self):
        return float(self.price) * 82.5

    @property
    def sale_price_in_inr(self):
        return float(self.sale_price) * 82.5 if self.sale_price is not None else None

    @property
    def current_price_in_inr(self):
        return float(self.current_price) * 82.5

    @property
    def is_in_stock(self):
        return self.stock_qty > 0

    @property
    def stock_status(self):
        if self.stock_qty <= 0:
            return 'out_of_stock'
        elif self.stock_qty <= self.low_stock_level:
            return 'low_stock'
        return 'in_stock'

    @property
    def average_rating(self):
        avg = self.reviews.filter(is_approved=True).aggregate(models.Avg('rating'))['rating__avg']
        return avg if avg is not None else 5.0

    @property
    def reviews_count(self):
        return self.reviews.filter(is_approved=True).count()

    def __str__(self):
        return self.name

class ProductGallery(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery')
    image = models.CharField(max_length=500, blank=True, null=True, help_text="Path to static image or URL")
    image_file = models.ImageField(upload_to='products/gallery/', blank=True, null=True)

    def __str__(self):
        return f"Gallery image for {self.product.name}"

class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')
    feature = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.product.name} - Feature: {self.feature}"

class ProductSpec(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specs')
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.product.name} - Spec: {self.name} = {self.value}"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5)  # 1 to 5 stars
    comment = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=True)
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name} ({self.rating} stars)"

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    sku_extension = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return f"{self.product.name} - {self.name} (₹{self.price})"

