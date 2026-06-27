from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('customer', 'Customer'),
        ('business_customer', 'Business Customer'),
        ('reseller', 'Reseller'),
        ('vendor', 'Vendor'),
        ('sales_executive', 'Sales Executive'),
        ('administrator', 'Administrator'),
    )
    user_type = models.CharField(max_length=30, choices=USER_TYPE_CHOICES, default='customer')
    is_customer = models.BooleanField(default=True)
    is_product_manager = models.BooleanField(default=False)
    is_order_manager = models.BooleanField(default=False)
    is_sales_manager = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    tax_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="GST / Tax ID")
    notification_preferences = models.JSONField(default=dict, blank=True, help_text="User preferences for email, whatsapp, etc.")
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()

class Address(models.Model):
    ADDRESS_TYPES = (
        ('shipping', 'Shipping Address'),
        ('billing', 'Billing Address'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20)
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPES, default='shipping')
    address_label = models.CharField(max_length=50, default='Office', help_text="e.g. Home, Office, Branch")
    is_default = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # If this address is set as default, mark other addresses of same type for this user as non-default
        if self.is_default:
            Address.objects.filter(
                user=self.user, 
                address_type=self.address_type, 
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.postal_code} ({self.get_address_type_display()})"
