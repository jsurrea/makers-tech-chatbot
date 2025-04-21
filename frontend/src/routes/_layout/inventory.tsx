import { createFileRoute } from "@tanstack/react-router"
import InventoryDashboard from "@/components/Admin/InventoryDashboard"

export const Route = createFileRoute("/_layout/inventory")({
    component: InventoryDashboard,
})
