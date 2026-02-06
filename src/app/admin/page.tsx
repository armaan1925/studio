import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function AdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome to the Admin Area</CardTitle>
                <CardDescription>
                    This section is for managing application content, users, and viewing analytics.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <LayoutDashboard className="size-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                        Admin features are under construction.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
