import { DataList } from "@radix-ui/themes";

// display a list of profiles
export default function ProfilesList({ profiles }: { profiles: any[] }) {
    return (
        <DataList.Root>
            {profiles.map(profile => (
                <DataList.Item key={profile.id}>
                    <DataList.Value>{profile.name}</DataList.Value>
                </DataList.Item>
            ))}
        </DataList.Root>
    );
}