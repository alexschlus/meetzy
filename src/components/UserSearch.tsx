
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, RefreshCw } from "lucide-react";
import UserListItem from "./UserListItem";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type UserSearchProps = {
  profiles: Profile[];
  isLoading: boolean;
  error: any;
  onRefresh: () => void;
  onAddUser: (profile: Profile) => void;
  loading: boolean;
};

export default function UserSearch({ 
  profiles, 
  isLoading, 
  error, 
  onRefresh, 
  onAddUser, 
  loading 
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => {
    console.log("Filtering profiles:", profiles, "with query:", searchQuery);
    if (!searchQuery.trim()) return profiles;
    return profiles.filter(profile =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profiles, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Refresh button */}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <span className="text-xs text-muted-foreground">
          Found: {profiles.length} users
        </span>
      </div>

      {/* User list */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">Error loading users: {error.message}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={onRefresh}>
              Try Again
            </Button>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No users found matching your search" : "No other users available"}
            </p>
            {profiles.length === 0 && (
              <div className="mt-2 text-xs text-destructive">
                <p>Try refreshing to load users</p>
              </div>
            )}
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <UserListItem
              key={profile.id}
              profile={profile}
              onAdd={onAddUser}
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
}
