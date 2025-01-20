import {getPost} from "@/app/dashboard/communities/actions/posts";
import ErrorComponent from "@/components/error-component";
import {Post} from "@/components/communities/(posts)/post";
import {getCommunity} from "@/app/dashboard/communities/actions/communities";
import {CommunityProvider} from "@/components/communities/community-provider";

/**
 * PostPage component that handles the display of a post within a community.
 *
 * @param {Object} props - The properties object.
 * @param {Promise<{ postId: string, id: string }>} props.params - The route parameters containing community ID and post ID.
 * @returns {JSX.Element} The rendered post page component.
 */
export default async function PostPage(props: { params: Promise<{ postId: string, id: string }> }) {
    const { id, postId } = await props.params

    // Fetch the community data based on the community ID
    const community = await getCommunity(id);

    // Fetch the post data based on the community ID and post ID
    const post = await getPost(id, postId)

    // If the post or community data is not available, render the error component
    if (!post || !community) {
        return <ErrorComponent error="Faild to load the post content..." returnTo={`/dashboard/communities/${id}`} />
    }

    // Render the Post component within the CommunityProvider with the fetched community and post data
    return (
        <div className="container mx-auto px-8 py-10">
            <CommunityProvider community={community}>
                <Post post={post} />
            </CommunityProvider>
        </div>
    )
}