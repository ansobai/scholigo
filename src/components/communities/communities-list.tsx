'use client'

import {UserCommunities} from "@/types/communities/communities";
import {CommunityCard} from "@/components/communities/community-card";
import {useSearchParams} from "next/navigation";

interface CommunitiesListProps {
    communities: UserCommunities[];
}

/**
 * Component for displaying a list of communities.
 *
 * @param {CommunitiesListProps} props - The properties for the component.
 * @param {UserCommunities[]} props.communities - The list of communities to display.
 * @returns {JSX.Element} The rendered CommunitiesList component.
 */
export default function CommunitiesList({ communities }: CommunitiesListProps) {
    const searchParams = useSearchParams()
    const query = searchParams.get("query") || "";

    const filteredCommunities = communities.filter((community) =>
        community.name.toLowerCase().includes(query.toLowerCase()) ||
        community.description?.toLowerCase().includes(query.toLowerCase()) ||
        community.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    return (
        <>
            {filteredCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
            ))}
        </>
    )
}