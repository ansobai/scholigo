import Communities from "@/components/communities/communities";
import {Suspense} from "react";
import {CommunitiesSkeleton} from "@/components/communities/skeleton";
import CreateCommunitiesModal from "@/components/communities/community-create";

/**
 * Renders the Communities page.
 *
 * This page displays a list of communities and includes a modal for creating new communities.
 * It uses React Suspense to show a loading skeleton while the communities are being fetched.
 *
 * @returns {JSX.Element} The rendered Communities page component.
 */
export default function CommunitiesPage() {
    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col justify-between my-8 md:flex-row">
                <h2 className="scroll-m-20 pb-2 text-4xl font-semibold tracking-tight first:mt-0 text-lightYellow">
                    Communities
                </h2>
                <CreateCommunitiesModal/>
            </div>
            <Suspense fallback={<CommunitiesSkeleton />}>
                <Communities />
            </Suspense>
        </div>
    )
}