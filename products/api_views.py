from rest_framework import generics
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Product
from .serializers import ProductSerializer

class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'short_desc', 'full_desc', 'category__name', 'brand__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'brand')
        
        # Simple query param filtering
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        brand_slugs = self.request.query_params.getlist('brand')
        if brand_slugs:
            queryset = queryset.filter(brand__slug__in=brand_slugs)
            
        return queryset

class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category', 'brand')
    serializer_class = ProductSerializer
    lookup_field = 'slug'
