import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export interface ItemType {
  _id:        string;
  title?:     string;
  name?:      string;
  location?:  string;
  category?:  string;
  condition?: string;
  imageUrl?:  string;
  image?:     string;
}

export function useBrowse() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const [items,         setItems]         = useState<ItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [totalPages,    setTotalPages]    = useState(1);
  const [currentPage,   setCurrentPage]   = useState(1);

  // ─── فلاتر البحث ───
  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedCity,      setSelectedCity]      = useState("");
  const [selectedCategory,  setSelectedCategory]  = useState("");

  // ─── حماية الصفحة ───
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login?msg=يجب تسجيل الدخول لتصفح التبرعات");
  }, [router]);

  // ─── جلب البيانات من الباك إند ───
  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/items`);
        if (!isMounted) return;

        const fetchedItems = res.data.items ?? [];
        setItems(fetchedItems);
        setFilteredItems(fetchedItems);
        setTotalPages(res.data.pages ?? 1);
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, [apiUrl]);

  // ─── فلترة تلقائية عند تغيير أي فلتر ───
  useEffect(() => {
    let result = items;

    if (selectedCity)     result = result.filter((i) => i.location === selectedCity);
    if (selectedCategory) result = result.filter((i) => i.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.title?.toLowerCase().includes(q) || i.name?.toLowerCase().includes(q)
      );
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCity, selectedCategory, items]);

  return {
    filteredItems, loading, totalPages, currentPage, setCurrentPage,
    searchQuery,      setSearchQuery,
    selectedCity,     setSelectedCity,
    selectedCategory, setSelectedCategory,
  };
}