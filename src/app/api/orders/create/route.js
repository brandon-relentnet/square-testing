// Ensure BigInts can be serialized to JSON.
BigInt.prototype.toJSON = function () {
    return Number(this);
};

export const runtime = 'nodejs';

import { randomUUID } from "crypto";
import { client, locationId } from '@/utils/squareInfo';

export async function POST(request) {
    const { cartItems } = await request.json();
    const lineItems = cartItems.map(item => {
        const variation = item.itemData?.variations?.[0];
        if (!variation || !variation.id) {
            throw new Error('Invalid item variation data');
        }
        return {
            catalogObjectId: variation.id,       // Use the variation's id from your catalog.
            quantity: item.quantity.toString(),    // Square expects quantity as a string.
            itemType: item.type,                   // For example: "ITEM"
        };
    });

    const orderResponse = await client.orders.create({
        idempotencyKey: randomUUID(),
        order: {
            locationId,
            lineItems,
        },
    });

    return new Response(JSON.stringify(orderResponse), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
