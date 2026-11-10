import type { Route } from "./+types/home";
import { useLoaderData, Form } from "react-router";
import { prisma } from "../../lib/db"; // Vérifie bien que ton fichier db.ts est dans app/lib/db.ts ou adapte le chemin

// 1. Métadonnées de la page
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mon Bookmark Manager 📑" },
    { name: "description", content: "Gestionnaire de favoris avec React Router v7 et SQLite" },
  ];
}

// 2. LOADER : Charge les données depuis SQLite avant le rendu de l'écran
export async function loader() {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: 1 }, // ID de ton utilisateur de test créé par le seeder
      orderBy: { id: "desc" },
    });
    return { bookmarks, error: null };
  } catch (err) {
    return { bookmarks: [], error: "Impossible de charger les favoris depuis SQLite." };
  }
}

// 3. ACTION : Intercepte la soumission du formulaire (POST)
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;

  if (!title || !url) return { error: "Veuillez remplir tous les champs." };

  try {
    await prisma.bookmark.create({
      data: {
        title,
        url: url.startsWith("http") ? url : `https://${url}`,
        userId: 1, // Attaché à l'utilisateur de test
      },
    });
    return { error: null }; // Déclenche automatiquement la mise à jour des données à l'écran !
  } catch (err) {
    return { error: "Erreur lors de la sauvegarde dans SQLite." };
  }
}

// 4. LE COMPOSANT VISUEL (FRONT-END)
export default function Home() {
  const { bookmarks, error } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #333", paddingBottom: "10px" }}>
        <h1>Mon Bookmark Manager 📑</h1>
        <span style={{ backgroundColor: "#e3f2fd", color: "#0d47a1", padding: "5px 10px", borderRadius: "4px", fontSize: "14px", fontWeight: "bold" }}>
          Utilisateur: Test User
        </span>
      </header>

      {/* FORMULAIRE D'AJOUT */}
      <div style={{ margin: "20px 0", padding: "15px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#fff" }}>
        <h3 style={{ marginTop: 0 }}>Ajouter un nouveau lien</h3>
        <Form method="post" style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            name="title"
            placeholder="Titre (ex: GitHub)" 
            required
            style={inputStyle}
          />
          <input 
            type="text" 
            name="url"
            placeholder="URL (ex: github.com)" 
            required
            style={inputStyle}
          />
          <button type="submit" style={btnStyle}>Enregistrer</button>
        </Form>
      </div>

      {/* LISTE DES FAVORIS */}
      <h2>Mes Favoris Sauvegardés</h2>
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark: any) => (
            <div key={bookmark.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{bookmark.title}</h4>
                <a href={bookmark.url} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>
                  Visiter le site ↗
                </a>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>Aucun favori enregistré.</p>
        )}
      </div>
    </div>
  );
}

const inputStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ccc", flex: 1 };
const btnStyle = { padding: "8px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
