import { Globe, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Component for displaying a skeleton loader for communities.
 *
 * @returns {JSX.Element} The rendered CommunitiesSkeleton component.
 */
export function CommunitiesSkeleton() {
    return (
        <div>
            <div className="h-10 w-full bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
            </div>

            <Tabs defaultValue="discovery" className="my-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="discovery">
                        <Globe className="mr-2" />
                        Discovery
                    </TabsTrigger>
                    <TabsTrigger value="joined">
                        <Users className="mr-2" />
                        Joined
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="discovery">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <CommunityCardSkeleton key={index} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="joined">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <CommunityCardSkeleton key={index} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

/**
 * Component for displaying a skeleton loader for a community card.
 *
 * @returns {JSX.Element} The rendered CommunityCardSkeleton component.
 */
function CommunityCardSkeleton() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div className="h-6 w-32 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                    </div>
                    <div className="h-8 w-8 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                    </div>
                </div>
                <div className="flex flex-col items-start mb-4 mt-2">
                    <div className="h-4 w-24 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden mb-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                    </div>
                    <div className="h-4 w-28 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="h-4 w-full bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden mb-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                </div>
                <div className="h-4 w-3/4 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden mb-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="h-6 w-16 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                        </div>
                    ))}
                </div>
            </CardContent>
            <div className="px-6 mt-auto pb-2">
                <div className="h-9 w-full bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                </div>
            </div>
        </Card>
    )
}