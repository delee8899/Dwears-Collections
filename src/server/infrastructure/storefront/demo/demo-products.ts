import type { StoreCollection, StoreProduct } from "../../../domains/catalog/catalog.types";
const p = (id:string, handle:string, title:string, price:string, image:string, condition:string, size:string, collectionHandles:string[], color:string): StoreProduct => ({ id, handle, title, description:`A thoughtfully selected pre-loved ${title.toLowerCase()} with plenty of life left. Each Dwears piece is one of a kind.`, condition, images:[image], price, currency:"USD", available:true, collectionHandles, variants:[{id:`demo-${id}-variant`,title:size,available:true,price,currency:"USD",options:[{name:"Size",value:size},{name:"Color",value:color}]}] });
export const demoProducts: StoreProduct[] = [
 p("jacket-01","olive-utility-jacket","Olive Utility Jacket","48.00","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85","Vintage · Very good","M",["jackets","clothing"],"Olive"),
 p("knit-01","the-sunday-knit","The Sunday Knit","36.00","https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=85","Pre-loved · Excellent","L",["clothing"],"Cream"),
 p("denim-01","90s-straight-leg-denim","90s Straight Leg Denim","42.00","https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85","Vintage · Great","Size 28",["clothing"],"Blue"),
 p("bag-01","everyday-leather-bag","Everyday Leather Bag","54.00","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85","Pre-loved · Very good","One size",["bags","accessories"],"Brown"),
 p("jacket-02","washed-denim-jacket","Washed Denim Jacket","52.00","https://images.unsplash.com/photo-1551027996-5a3b7d46baf5?auto=format&fit=crop&w=900&q=85","Vintage · Great","S",["jackets","clothing"],"Blue"),
 p("accessory-01","everyday-shades","Everyday Shades","22.00","https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85","Pre-loved · Excellent","One size",["accessories"],"Tortoise"),
];
export const demoCollections: StoreCollection[] = [
 {handle:"jackets",title:"Jackets",description:"Layers with history.",image:demoProducts[0].images[0],productCount:2},
 {handle:"clothing",title:"Clothing",description:"Everyday, reimagined.",image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",productCount:4},
 {handle:"bags",title:"Bags",description:"Carry it forward.",image:demoProducts[3].images[0],productCount:1},
 {handle:"accessories",title:"Accessories",description:"Little things, big mood.",image:demoProducts[5].images[0],productCount:2},
];