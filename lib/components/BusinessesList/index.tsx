import { DataList, Link } from "@radix-ui/themes";

export default function BusinessesList({ businesses }: { businesses: any[] }) {
    return (
        <DataList.Root>
            {businesses.map(business => (
                <DataList.Item key={business.id}>
                    <DataList.Value><Link href={`/business/${business.id}`}>{business.name}
                    </Link></DataList.Value>
                </DataList.Item>

            ))}
        </DataList.Root>
    );
}
