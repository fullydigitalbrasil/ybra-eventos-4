import { getMedia } from '../lib/data';
import EventosClient from './EventosClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const data = await getMedia();
  return <EventosClient items={data.items || []} />;
}
