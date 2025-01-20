import {getCommunity} from "@/app/dashboard/communities/actions/communities";
import ErrorComponent from "@/components/error-component";
import CommunityView from "@/components/communities/community-view";
import {CommunityProvider} from "@/components/communities/community-provider";
import {getLatestCommunityPosts} from "@/app/dashboard/communities/actions/posts";

/**
 * CommunityPage component that handles the display of a community and its latest posts.
 *
 * @param {Object} props - The properties object.
 * @param {Promise<{ id: string }>} props.params - The route parameters containing the community ID.
 * @returns {JSX.Element} The rendered community page component.
 */
export default async function CommunityPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    // Fetch the community data based on the community ID
    const community = await getCommunity(id);

    // If the community data is not available, render the error component
    if (!community) {
        return <ErrorComponent error="Failed to load community!" returnTo="/dashboard/communities" />
    }

    // Fetch the latest posts for the community based on the community ID
    const posts = await getLatestCommunityPosts(id);

    // Render the CommunityView component within the CommunityProvider with the fetched community and posts data
    return (
        <div className="container mx-auto py-10">
            <CommunityProvider community={community}>
                <CommunityView initPosts={posts} />
            </CommunityProvider>
        </div>
    )
}