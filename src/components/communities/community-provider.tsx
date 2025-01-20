'use client'

import {createContext, useContext, ReactNode, useEffect} from 'react'
import {UserCommunities} from "@/types/communities/communities";
import {usePermissions} from "@/hooks/use-permissions";

type CommunityContextType = {
    community: UserCommunities | null
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

/**
 * Provider component for the Community context.
 *
 * @param {Object} props - The properties for the component.
 * @param {ReactNode} props.children - The child components to be wrapped by the provider.
 * @param {UserCommunities | null} props.community - The community data to be provided.
 * @returns {JSX.Element} The rendered CommunityProvider component.
 */
export function CommunityProvider({ children, community }: { children: ReactNode; community: UserCommunities | null }) {
    const { setCurrentCommunity } = usePermissions();

    /**
     * Updates the community permissions.
     *
     * @param {string} communityId - The ID of the community.
     */
    const updateCommunityPermissions = async (communityId: string) => {
        setCurrentCommunity(communityId);
    };

    if (community) {
        useEffect(() => {
            console.log('CommunityProvider: useEffect');
            updateCommunityPermissions(community.id);
        }, [community, setCurrentCommunity]);
    }

    return (
        <CommunityContext.Provider value={{ community }}>
            {children}
        </CommunityContext.Provider>
    )
}

/**
 * Custom hook to access the Community context.
 *
 * @throws Will throw an error if used outside of a CommunityProvider.
 * @returns {UserCommunities | null} The community data from the context.
 */
export function useCommunity() {
    const context = useContext(CommunityContext)
    if (context === undefined) {
        throw new Error('useCommunity must be used within a CommunityProvider')
    }
    return context.community
}