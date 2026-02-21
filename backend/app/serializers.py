from rest_framework import serializers
from .models import Item, StockOutTransaction

class ItemSerializer(serializers.ModelSerializer):
    allocation_type_display = serializers.CharField(source='get_allocation_type_display', read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'quantity', 'unit', 
            'allocation_type', 'allocation_type_display', 
            'created_at', 'updated_at'
        ]

class StockOutTransactionSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_unit = serializers.CharField(source='item.unit', read_only=True)
    released_by_name = serializers.CharField(source='released_by.username', read_only=True)

    class Meta:
        model = StockOutTransaction
        fields = [
            'id', 'item', 'item_name', 'item_unit', 'quantity_deducted', 
            'release_date', 'remarks', 'released_by', 'released_by_name'
        ]
        read_only_fields = ['released_by'] # We will set this automatically in the view

    def validate(self, data):
        """
        Ensure that the quantity requested for stock-out does not exceed available inventory.
        """
        item = data['item']
        quantity_deducted = data['quantity_deducted']

        if item.quantity < quantity_deducted:
            raise serializers.ValidationError({
                "quantity_deducted": f"Cannot deduct {quantity_deducted}. Only {item.quantity} available in stock."
            })
        
        return data