from rest_framework import viewsets, permissions
from .models import Item, StockOutTransaction
from .serializers import ItemSerializer, StockOutTransactionSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().order_by('-created_at')
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated] # Requires JWT token

    def get_queryset(self):
        """
        Optionally filter items by allocation type (e.g., /api/items/?allocation_type=NC2)
        """
        queryset = super().get_queryset()
        allocation_type = self.request.query_params.get('allocation_type', None)
        if allocation_type is not None:
            queryset = queryset.filter(allocation_type=allocation_type)
        return queryset

class StockOutTransactionViewSet(viewsets.ModelViewSet):
    queryset = StockOutTransaction.objects.all().order_by('-release_date')
    serializer_class = StockOutTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Automatically assign the logged-in user to the 'released_by' field when a transaction is created.
        """
        serializer.save(released_by=self.request.user)