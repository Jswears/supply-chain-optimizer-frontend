import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Product } from "@/types"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const isLowStock = product.stock_level < product.reorder_threshold

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Link
                            href={`/dashboard/products/${product.warehouse_id}/${product.product_id}`}
                            className="text-lg font-semibold text-primary hover:underline"
                        >
                            {product.product_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                    </div>
                    {isLowStock ? <Badge variant="destructive">Low Stock</Badge> : <Badge variant="secondary">In Stock</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Stock Level</p>
                        <p className="font-medium">{product.stock_level}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Reorder At</p>
                        <p className="font-medium">{product.reorder_threshold}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 px-6 py-3">
                <p className="text-sm">Supplier: {product.supplier}</p>
            </CardFooter>
        </Card>
    )
}

