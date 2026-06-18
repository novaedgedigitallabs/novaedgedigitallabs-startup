import Feed, { Startup } from "./components/Feed";

async function getStartups(): Promise<Startup[]> {
  try {
    const res = await fetch("http://localhost:4000/api/startups", {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.startups || [];
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    return [];
  }
}

export default async function Home() {
  const initialStartups = await getStartups();

  return (
    <div className="w-full">
      <Feed initialStartups={initialStartups} />
    </div>
  );
}
