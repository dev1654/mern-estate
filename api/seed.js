import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./models/listing.model.js";
import User from "./models/user.model.js";

dotenv.config();

const IMAGES = {
  apartment: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  ],
  house: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  ],
  villa: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
  ],
  studio: [
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
  ],
  condo: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80",
  ],
  townhouse: [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  ],
};

const LISTINGS = [
  { name: "Luxury 3BHK Sea-View Apartment", description: "Stunning sea-view apartment in the heart of South Mumbai with premium finishes, modular kitchen, and 24/7 security. Walking distance to Marine Drive and top restaurants.", address: "Cuffe Parade, Mumbai, Maharashtra 400005", type: "sale", propertyType: "apartment", bedrooms: 3, bathrooms: 3, regularPrice: 45000000, discountPrice: 42000000, offer: true, parking: true, furnished: true, pool: true, squareFeet: 2100, yearBuilt: 2020, images: IMAGES.apartment },
  { name: "Cozy 1BHK Studio in Bandra", description: "Modern studio apartment in the vibrant Bandra West area. Perfect for young professionals. Close to Carter Road, cafes, and excellent public transport.", address: "Bandra West, Mumbai, Maharashtra 400050", type: "rent", propertyType: "studio", bedrooms: 1, bathrooms: 1, regularPrice: 45000, discountPrice: 0, offer: false, parking: false, furnished: true, pool: false, squareFeet: 450, yearBuilt: 2018, images: IMAGES.studio },
  { name: "Spacious 4BHK Independent House", description: "Large independent bungalow with private garden, modular kitchen, and dedicated parking for 2 cars. Quiet residential colony close to schools and hospitals.", address: "Vasant Vihar, New Delhi 110057", type: "sale", propertyType: "house", bedrooms: 4, bathrooms: 4, regularPrice: 65000000, discountPrice: 60000000, offer: true, parking: true, furnished: false, pool: false, squareFeet: 3500, yearBuilt: 2015, images: IMAGES.house },
  { name: "Modern 2BHK Apartment in Powai", description: "Contemporary apartment in Hiranandani Gardens with scenic lake views, world-class amenities, gymnasium, and swimming pool in a gated society.", address: "Hiranandani Gardens, Powai, Mumbai 400076", type: "rent", propertyType: "apartment", bedrooms: 2, bathrooms: 2, regularPrice: 65000, discountPrice: 58000, offer: true, parking: true, furnished: true, pool: true, squareFeet: 1100, yearBuilt: 2019, images: IMAGES.apartment },
  { name: "Premium Villa with Pool in Whitefield", description: "Magnificent 5-bedroom villa in a premium gated community with private swimming pool, landscaped garden, home theatre, and smart home automation.", address: "Whitefield, Bangalore, Karnataka 560066", type: "sale", propertyType: "villa", bedrooms: 5, bathrooms: 5, regularPrice: 85000000, discountPrice: 0, offer: false, parking: true, furnished: true, pool: true, squareFeet: 5200, yearBuilt: 2021, images: IMAGES.villa },
  { name: "Affordable 2BHK in Koramangala", description: "Well-maintained 2BHK apartment in the tech hub of Bangalore. Easy access to major IT parks, restaurants, and shopping malls. Society has gym and park.", address: "Koramangala 5th Block, Bangalore 560095", type: "rent", propertyType: "apartment", bedrooms: 2, bathrooms: 2, regularPrice: 35000, discountPrice: 0, offer: false, parking: true, furnished: false, pool: false, squareFeet: 950, yearBuilt: 2016, images: IMAGES.apartment },
  { name: "Heritage Haveli Converted to Modern Home", description: "Unique restored haveli blending Rajasthani architecture with modern amenities. Courtyard, rooftop terrace with city views, handcrafted interiors.", address: "Civil Lines, Jaipur, Rajasthan 302006", type: "sale", propertyType: "house", bedrooms: 6, bathrooms: 5, regularPrice: 35000000, discountPrice: 32000000, offer: true, parking: true, furnished: true, pool: false, squareFeet: 4800, yearBuilt: 1920, images: IMAGES.house },
  { name: "Studio Apartment Near Cyber City", description: "Compact and efficient studio apartment perfect for IT professionals. Walking distance to DLF Cyber City, IFFCO Chowk metro station.", address: "DLF Phase 2, Gurugram, Haryana 122002", type: "rent", propertyType: "studio", bedrooms: 1, bathrooms: 1, regularPrice: 25000, discountPrice: 22000, offer: true, parking: false, furnished: true, pool: false, squareFeet: 380, yearBuilt: 2017, images: IMAGES.studio },
  { name: "3BHK Penthouse with Terrace Garden", description: "Exclusive penthouse on the top floor with a massive terrace garden, private Jacuzzi, and panoramic views of the Hyderabad skyline.", address: "Jubilee Hills, Hyderabad, Telangana 500033", type: "sale", propertyType: "apartment", bedrooms: 3, bathrooms: 3, regularPrice: 38000000, discountPrice: 0, offer: false, parking: true, furnished: true, pool: false, squareFeet: 2800, yearBuilt: 2022, images: IMAGES.apartment },
  { name: "Budget-Friendly 1BHK in Hinjewadi", description: "Affordable 1BHK apartment ideal for IT professionals working in Hinjewadi IT Park. Society amenities include gym, garden, and security.", address: "Hinjewadi Phase 1, Pune, Maharashtra 411057", type: "rent", propertyType: "apartment", bedrooms: 1, bathrooms: 1, regularPrice: 18000, discountPrice: 0, offer: false, parking: false, furnished: false, pool: false, squareFeet: 580, yearBuilt: 2014, images: IMAGES.apartment },
  { name: "Luxury Row House in Boat Club Road", description: "Prestigious row house in one of Pune's most elite addresses. Gated community with round-the-clock security, club house, and swimming pool.", address: "Boat Club Road, Pune, Maharashtra 411001", type: "sale", propertyType: "townhouse", bedrooms: 4, bathrooms: 4, regularPrice: 55000000, discountPrice: 52000000, offer: true, parking: true, furnished: true, pool: true, squareFeet: 3800, yearBuilt: 2019, images: IMAGES.townhouse },
  { name: "2BHK Garden Apartment in Indiranagar", description: "Charming garden-facing apartment in leafy Indiranagar. Peaceful neighbourhood with great connectivity to the metro and city's finest restaurants.", address: "100 Feet Road, Indiranagar, Bangalore 560038", type: "rent", propertyType: "apartment", bedrooms: 2, bathrooms: 2, regularPrice: 42000, discountPrice: 38000, offer: true, parking: true, furnished: true, pool: false, squareFeet: 1050, yearBuilt: 2017, images: IMAGES.apartment },
  { name: "4BHK Duplex Condo in Noida", description: "Spectacular duplex condo in an integrated township with world-class facilities. Features double-height living area, rooftop access, and premium fixtures.", address: "Sector 137, Noida, Uttar Pradesh 201305", type: "sale", propertyType: "condo", bedrooms: 4, bathrooms: 4, regularPrice: 18500000, discountPrice: 17000000, offer: true, parking: true, furnished: false, pool: true, squareFeet: 2600, yearBuilt: 2020, images: IMAGES.condo },
  { name: "Sea-Facing Apartment in Adyar", description: "Beautiful apartment with direct sea views from the living room and master bedroom. Fully furnished with high-end appliances and wooden flooring.", address: "Adyar, Chennai, Tamil Nadu 600020", type: "rent", propertyType: "apartment", bedrooms: 3, bathrooms: 2, regularPrice: 75000, discountPrice: 0, offer: false, parking: true, furnished: true, pool: false, squareFeet: 1650, yearBuilt: 2015, images: IMAGES.apartment },
  { name: "Compact Studio in Salt Lake City", description: "Well-designed studio apartment in the IT hub of Kolkata. Fully furnished with all modern amenities, close to Sector V and metro station.", address: "Sector V, Salt Lake City, Kolkata 700091", type: "rent", propertyType: "studio", bedrooms: 1, bathrooms: 1, regularPrice: 15000, discountPrice: 13500, offer: true, parking: false, furnished: true, pool: false, squareFeet: 420, yearBuilt: 2016, images: IMAGES.studio },
  { name: "5BHK Colonial Bungalow", description: "Grand colonial-style bungalow with high ceilings, vintage wooden floors, landscaped garden with fruit trees, outhouse, and servant quarters.", address: "Alipore, Kolkata, West Bengal 700027", type: "sale", propertyType: "house", bedrooms: 5, bathrooms: 5, regularPrice: 75000000, discountPrice: 0, offer: false, parking: true, furnished: false, pool: false, squareFeet: 6500, yearBuilt: 1965, images: IMAGES.house },
  { name: "Modern Townhouse in Gachibowli", description: "Contemporary 3-floor townhouse in the IT corridor of Hyderabad. Open-plan design, modular kitchen, private terrace, and 2-car parking.", address: "Gachibowli, Hyderabad, Telangana 500032", type: "sale", propertyType: "townhouse", bedrooms: 3, bathrooms: 3, regularPrice: 22000000, discountPrice: 0, offer: false, parking: true, furnished: false, pool: false, squareFeet: 2200, yearBuilt: 2021, images: IMAGES.townhouse },
  { name: "2BHK Flat in Chandivali", description: "Well-maintained 2BHK in Powai's Chandivali area. Gated society with 24/7 security, children's play area, and jogging track. Close to IT parks.", address: "Chandivali, Andheri East, Mumbai 400072", type: "rent", propertyType: "apartment", bedrooms: 2, bathrooms: 2, regularPrice: 40000, discountPrice: 0, offer: false, parking: true, furnished: false, pool: false, squareFeet: 900, yearBuilt: 2013, images: IMAGES.apartment },
  { name: "Luxury Villa in Electronic City", description: "Elegant villa with smart home features, home office, entertainment room, private pool and garden. Perfect for senior tech professionals.", address: "Electronic City Phase 1, Bangalore 560100", type: "sale", propertyType: "villa", bedrooms: 4, bathrooms: 4, regularPrice: 42000000, discountPrice: 39000000, offer: true, parking: true, furnished: true, pool: true, squareFeet: 4200, yearBuilt: 2022, images: IMAGES.villa },
  { name: "1BHK Apartment in Kalyani Nagar", description: "Stylish 1BHK apartment in the trendy Kalyani Nagar locality. Fully furnished with modern furniture, close to restaurants, pubs, and shopping.", address: "Kalyani Nagar, Pune, Maharashtra 411006", type: "rent", propertyType: "apartment", bedrooms: 1, bathrooms: 1, regularPrice: 22000, discountPrice: 20000, offer: true, parking: false, furnished: true, pool: false, squareFeet: 620, yearBuilt: 2018, images: IMAGES.apartment },
  { name: "Beachside Condo in ECR", description: "Rare beachside condominium on East Coast Road with private beach access, infinity pool, and stunning Bay of Bengal views from every room.", address: "East Coast Road, Thiruvanmiyur, Chennai 600041", type: "sale", propertyType: "condo", bedrooms: 3, bathrooms: 3, regularPrice: 28000000, discountPrice: 26000000, offer: true, parking: true, furnished: true, pool: true, squareFeet: 2400, yearBuilt: 2020, images: IMAGES.condo },
  { name: "3BHK in DLF Garden City", description: "Spacious 3BHK apartment in the premium DLF Garden City township. Excellent amenities: club house, tennis court, swimming pool, and landscaped gardens.", address: "DLF Garden City, Shela, Ahmedabad 380058", type: "rent", propertyType: "apartment", bedrooms: 3, bathrooms: 2, regularPrice: 30000, discountPrice: 0, offer: false, parking: true, furnished: false, pool: true, squareFeet: 1400, yearBuilt: 2017, images: IMAGES.apartment },
  { name: "Independent House in Jayanagar", description: "Solid G+2 independent house in South Bangalore's premier locality. Good rental yield potential. Large plot with space for an additional floor.", address: "Jayanagar 4th Block, Bangalore 560011", type: "sale", propertyType: "house", bedrooms: 6, bathrooms: 4, regularPrice: 58000000, discountPrice: 55000000, offer: true, parking: true, furnished: false, pool: false, squareFeet: 3200, yearBuilt: 2008, images: IMAGES.house },
  { name: "Furnished Studio in Hauz Khas", description: "Hip and modern studio in Delhi's arty Hauz Khas Village area. Walking distance to the lake, art galleries, and vibrant nightlife. Ideal for creatives.", address: "Hauz Khas Village, New Delhi 110016", type: "rent", propertyType: "studio", bedrooms: 1, bathrooms: 1, regularPrice: 28000, discountPrice: 25000, offer: true, parking: false, furnished: true, pool: false, squareFeet: 400, yearBuilt: 2019, images: IMAGES.studio },
  { name: "Panoramic View 2BHK in Viman Nagar", description: "Beautiful 2BHK with city skyline views on a high floor. Modern kitchen, large balcony, and great connectivity to Pune airport and IT parks.", address: "Viman Nagar, Pune, Maharashtra 411014", type: "sale", propertyType: "apartment", bedrooms: 2, bathrooms: 2, regularPrice: 9500000, discountPrice: 9000000, offer: true, parking: true, furnished: false, pool: true, squareFeet: 1050, yearBuilt: 2021, images: IMAGES.apartment },
];

async function seed() {
  await mongoose.connect(process.env.MONGO);
  console.log("Connected to MongoDB");

  // Find first user
  const user = await User.findOne();
  if (!user) {
    console.log("No users found. Please sign up first, then run seed again.");
    process.exit(1);
  }
  console.log(`Using user: ${user.username} (${user._id})`);

  // Clear old listings
  await Listing.deleteMany({});
  console.log("Cleared existing listings");

  const docs = LISTINGS.map((l) => ({
    name: l.name,
    description: l.description,
    address: l.address,
    regularPrice: l.regularPrice,
    discountPrice: l.discountPrice || 0,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    furnished: l.furnished,
    parking: l.parking,
    type: l.type,
    offer: l.offer,
    imageUrls: l.images,
    userRef: user._id.toString(),
    propertyType: l.propertyType,
    squareFeet: l.squareFeet,
    yearBuilt: l.yearBuilt,
    pool: l.pool,
    petFriendly: false,
    views: Math.floor(Math.random() * 200),
    status: "active",
  }));

  await Listing.insertMany(docs);
  console.log(`Seeded ${docs.length} listings successfully!`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
