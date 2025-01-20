import {getCommunity} from "@/app/dashboard/communities/actions/communities";
import ErrorComponent from "@/components/error-component";
import EditPost from "@/components/communities/(posts)/edit-post";
import {getPost} from "@/app/dashboard/communities/actions/posts";

/**
 * PostEditPage component that handles the editing of a post within a community.
 *
 * @param {Object} props - The properties object.
 * @param {Promise<{ postId: string, id: string }>} props.params - The route parameters containing community ID and post ID.
 * @returns {JSX.Element} The rendered edit post page component.
 */
export default async function PostEditPage(props: { params: Promise<{ postId: string, id: string }> }) {
    const { id, postId } = await props.params

    // Fetch the community data based on the community ID
    const community = await getCommunity(id);

    // Fetch the post data based on the community ID and post ID
    const post = await getPost(id, postId)

    // If the post or community data is not available, render the error component
    if (!post || !community) {
        return <ErrorComponent error="Failed to load the post content..." returnTo={`/dashboard/communities/${id}`} />
    }

    // Render the EditPost component with the fetched community and post data
    return (
        <EditPost community={community} post={post} />
    )
}