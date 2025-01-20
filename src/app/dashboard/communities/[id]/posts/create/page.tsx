import ErrorComponent from "@/components/error-component";
import {getCommunity} from "@/app/dashboard/communities/actions/communities";
import CreatePosts from "@/components/communities/(posts)/create-posts";

/**
 * PostCreatePage component that handles the creation of a new post within a community.
 *
 * @param {Object} props - The properties object.
 * @param {Promise<{ id: string }>} props.params - The route parameters containing the community ID.
 * @returns {JSX.Element} The rendered create post page component.
 */
export default async function PostCreatePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    // Fetch the community data based on the community ID
    const community = await getCommunity(id);

    // If the community data is not available, render the error component
    if (!community) {
        return <ErrorComponent error="Failed to load community!" returnTo="/dashboard/communities" />
    }

    // Render the CreatePosts component with the fetched community data
    return (
        <CreatePosts community={community} />
    )
}