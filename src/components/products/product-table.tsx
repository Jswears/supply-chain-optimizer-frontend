import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Product } from "@/types"

interface ProductTableProps {
    products: Product[]
}

export function ProductTable({ products }: ProductTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                                No products found
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.product_id}>
                                <TableCell className="font-medium">
                                    <Link href={`/dashboard/products/${product.warehouse_id}/${product.product_id}`} className="text-secondary font-semibold hover:underline">
                                        {product.product_name}
                                    </Link>
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.stock_level}</TableCell>
                                <TableCell>{product.supplier}</TableCell>
                                <TableCell>
                                    {product.stock_level < product.reorder_threshold ? (
                                        <Badge variant="destructive">Low Stock</Badge>
                                    ) : (
                                        <Badge variant="secondary">In Stock</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

