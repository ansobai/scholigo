import SearchComponent from "@/components/ui/search";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Globe, Users} from "lucide-react";
import {getJoinedCommunities, getRecommendedCommunities} from "@/app/dashboard/communities/actions/communities";
import CommunitiesList from "@/components/communities/communities-list";

/**
 * Component for displaying the communities page with search and tab functionality.
 *
 * @returns {JSX.Element} The rendered Communities component.
 */
export default async function Communities() {
    const [joinedCommunities, recommendedCommunities] = await Promise.all([
        getJoinedCommunities(),
        getRecommendedCommunities()
    ])

    return (
        <div>
            <SearchComponent placeholder="Search communities..." />

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
                        <CommunitiesList communities={recommendedCommunities} />
                    </div>
                </TabsContent>
                <TabsContent value="joined">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <CommunitiesList communities={joinedCommunities} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}