const axios = require("axios");

// API Base URL
const API_BASE_URL = "https://jovial-bouman.104-247-167-194.plesk.page";

// JWT Token'ını buraya yapıştır (tarayıcıdan Application -> Cookies -> authToken)
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImVlNGYwZDkxLTQ3MWMtNGU3Yi1iYTY4LTMyNGZiOTk0MWE1OCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6InNvcmFsZmF0aWgzQGdtYWlsLmNvbSIsImp0aSI6ImI4MjI3ZTVlLTNmYzEtNDg0ZS05ZjUxLTIzNjQxOWRkMTI3MSIsImlhdCI6IjYvMS8yMDI1IDI6NTc6MjAgUE0iLCJleHAiOjE3NDg3OTcwNDAsImlzcyI6IlFyTWVudS5BUEkuSXNzdWVyIiwiYXVkIjoiUXJNZW51LkFQSS5BdWRpZW5jZSJ9.dAzHnxO-MTBF6yeiRftcTqpgDXnc4xMn6hzWJrraSqU";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${JWT_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Restoran Menüsü Dataset
const dataset = {
  menus: [
    {
      title: "İçecekler",
      description: "Sıcak ve soğuk içecek çeşitlerimiz",
      imageUrl: "",
      language: "tr",
      categories: [
        {
          name: "Sıcak İçecekler",
          description: "Sıcacık içeceklerimiz",
          imageUrl: "",
          products: [
            {
              name: "Çay",
              description: "Geleneksel Türk çayı, cam bardakta servis edilir",
              price: 40.0,
              imageUrl: "",
            },
            {
              name: "Türk Kahvesi",
              description: "Geleneksel Türk kahvesi, şekerli veya sade",
              price: 100.0,
              imageUrl: "",
            },
            {
              name: "Nescafe",
              description: "Hazır kahve, sıcak süt ile",
              price: 100.0,
              imageUrl: "",
            },
          ],
        },
        {
          name: "Soğuk İçecekler",
          description: "Serinletici içeceklerimiz",
          imageUrl: "",
          products: [
            {
              name: "Ayran",
              description: "Ev yapımı taze ayran",
              price: 70.0,
              imageUrl: "",
            },
            {
              name: "Sodalar",
              description: "Kola, gazoz, fanta çeşitleri",
              price: 70.0,
              imageUrl: "",
            },
            {
              name: "Küçük su",
              description: "500ml doğal kaynak suyu",
              price: 20.0,
              imageUrl: "",
            },
            {
              name: "Büyük su",
              description: "1.5L doğal kaynak suyu",
              price: 50.0,
              imageUrl: "",
            },
            {
              name: "Meşrubatlar",
              description: "Meyve suları ve çeşitli meşrubatlar",
              price: 100.0,
              imageUrl: "",
            },
            {
              name: "Red Bull",
              description: "Enerji içeceği",
              price: 150.0,
              imageUrl: "",
            },
          ],
        },
        {
          name: "Alkollü İçecekler",
          description: "Alkollü içecek seçeneklerimiz",
          imageUrl: "",
          products: [
            {
              name: "Bira (50cl)",
              description: "Soğuk bira, 50cl şişe",
              price: 250.0,
              imageUrl: "",
            },
            {
              name: "Miller",
              description: "Miller bira",
              price: 300.0,
              imageUrl: "",
            },
          ],
        },
      ],
    },
    {
      title: "Tost Çeşitleri",
      description: "Taze malzemelerle hazırlanan tost çeşitlerimiz",
      imageUrl: "",
      language: "tr",
      categories: [
        {
          name: "Klasik Tostlar",
          description: "Geleneksel tost çeşitleri",
          imageUrl: "",
          products: [
            {
              name: "Kaşarlı Tost",
              description: "Kaşar peyniri ile hazırlanan klasik tost",
              price: 150.0,
              imageUrl: "",
            },
            {
              name: "Kaşarlı tost (yarım ekmek)",
              description: "Yarım ekmek üzerinde kaşarlı tost",
              price: 250.0,
              imageUrl: "",
            },
          ],
        },
        {
          name: "Özel Tostlar",
          description: "Özel malzemelerle hazırlanan tostlar",
          imageUrl: "",
          products: [
            {
              name: "Sucuklu Tost",
              description: "Sucuk ve kaşar peyniri ile",
              price: 200.0,
              imageUrl: "",
            },
            {
              name: "Sucuklu tost (yarım ekmek)",
              description: "Yarım ekmek üzerinde sucuklu tost",
              price: 350.0,
              imageUrl: "",
            },
            {
              name: "Karışık Tost",
              description: "Sucuk, kaşar, domates karışımı",
              price: 200.0,
              imageUrl: "",
            },
          ],
        },
      ],
    },
    {
      title: "Ana Yemekler",
      description: "Doyurucu ana yemek seçeneklerimiz",
      imageUrl: "",
      language: "tr",
      categories: [
        {
          name: "Et Yemekleri",
          description: "Taze et ile hazırlanan yemekler",
          imageUrl: "",
          products: [
            {
              name: "Urfa",
              description: "Geleneksel Urfa kebabı",
              price: 500.0,
              imageUrl: "",
            },
            {
              name: "Adana",
              description: "Acılı Adana kebabı",
              price: 500.0,
              imageUrl: "",
            },
            {
              name: "Köfte (yarım ekmek)",
              description: "Köfte yarım ekmek üzerinde",
              price: 500.0,
              imageUrl: "",
            },
            {
              name: "Köfte (porsiyon)",
              description: "Köfte porsiyon halinde",
              price: 500.0,
              imageUrl: "",
            },
            {
              name: "Hamburger",
              description: "Özel soslu hamburger",
              price: 400.0,
              imageUrl: "",
            },
            {
              name: "Sosis (porsiyon)",
              description: "Izgara sosis porsiyon",
              price: 400.0,
              imageUrl: "",
            },
          ],
        },
        {
          name: "Aperatifler",
          description: "Hafif atıştırmalıklar",
          imageUrl: "",
          products: [
            {
              name: "Patates",
              description: "Kızarmış patates",
              price: 300.0,
              imageUrl: "",
            },
            {
              name: "Sigara böreği",
              description: "Çıtır sigara böreği",
              price: 300.0,
              imageUrl: "",
            },
          ],
        },
      ],
    },
    {
      title: "Kahvaltı & Hafif Yemekler",
      description: "Kahvaltı ve hafif yemek seçenekleri",
      imageUrl: "",
      language: "tr",
      categories: [
        {
          name: "Kahvaltılık",
          description: "Kahvaltı çeşitlerimiz",
          imageUrl: "",
          products: [
            {
              name: "Omlet",
              description: "Sade omlet",
              price: 200.0,
              imageUrl: "",
            },
            {
              name: "Sucuklu Yumurta",
              description: "Sucuklu sahanda yumurta",
              price: 300.0,
              imageUrl: "",
            },
            {
              name: "Kahvaltı tabağı",
              description: "Serpme kahvaltı tabağı",
              price: 700.0,
              imageUrl: "",
            },
            {
              name: "Yengen",
              description: "Yoğurt, peynir ve sebze karışımı",
              price: 200.0,
              imageUrl: "",
            },
          ],
        },
        {
          name: "Mevsim Salataları",
          description: "Taze salata çeşitlerimiz",
          imageUrl: "",
          products: [
            {
              name: "Salata (çoban)",
              description: "Domates, salatalık, soğan, maydanoz salata",
              price: 250.0,
              imageUrl: "",
            },
          ],
        },
        {
          name: "Mevsim Meyveleri",
          description: "Taze mevsim meyveleri",
          imageUrl: "",
          products: [
            {
              name: "Karpuz kavun",
              description: "Taze karpuz ve kavun dilimler",
              price: 250.0,
              imageUrl: "",
            },
          ],
        },
      ],
    },
  ],
};

// Progress tracker
let progress = {
  menus: 0,
  categories: 0,
  products: 0,
};

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Ana fonksiyon
async function populateData() {
  try {
    console.log("🚀 Restoran menüsü ekleme başlıyor...\n");

    if (JWT_TOKEN === "BURAYA_JWT_TOKEN_YAPISTIR") {
      console.error(
        "❌ JWT Token eksik! Lütfen script'te JWT_TOKEN değişkenini düzenleyin."
      );
      return;
    }

    for (const menuData of dataset.menus) {
      console.log(`📁 Ana menü oluşturuluyor: ${menuData.title}`);

      // Ana menü oluştur
      const menuPayload = {
        name: menuData.title,
        description: menuData.description,
        imageUrl: menuData.imageUrl,
        language: menuData.language,
      };

      const menuResponse = await api.post("/api/base/menu", menuPayload);

      if (menuResponse.data.isSucceed) {
        const menuId = menuResponse.data.data.id;
        progress.menus++;
        console.log(
          `✅ Ana menü oluşturuldu: ${menuData.title} (ID: ${menuId})`
        );

        await delay(500);

        // Kategorileri oluştur
        for (const categoryData of menuData.categories) {
          console.log(`  📂 Kategori oluşturuluyor: ${categoryData.name}`);

          const categoryPayload = {
            menuId: menuId,
            name: categoryData.name,
            description: categoryData.description,
            imageUrl: categoryData.imageUrl,
          };

          const categoryResponse = await api.post(
            "/api/base/category",
            categoryPayload
          );

          if (categoryResponse.data.isSucceed) {
            const categoryId = categoryResponse.data.data.id;
            progress.categories++;
            console.log(
              `    ✅ Kategori oluşturuldu: ${categoryData.name} (ID: ${categoryId})`
            );

            await delay(300);

            // Ürünleri oluştur
            for (const productData of categoryData.products) {
              console.log(`    🍽️  Ürün ekleniyor: ${productData.name}`);

              const productPayload = {
                categoryId: categoryId,
                name: productData.name,
                description: productData.description,
                imageUrl: productData.imageUrl,
                price: productData.price,
              };

              const productResponse = await api.post(
                "/api/base/product",
                productPayload
              );

              if (productResponse.data.isSucceed) {
                progress.products++;
                console.log(
                  `      ✅ Ürün eklendi: ${productData.name} (${productData.price}₺)`
                );
              } else {
                console.log(`      ❌ Ürün eklenemedi: ${productData.name}`);
                console.log("      📋 Hata:", productResponse.data.message);
              }

              await delay(200);
            }
          } else {
            console.log(`    ❌ Kategori oluşturulamadı: ${categoryData.name}`);
            console.log("    📋 Hata:", categoryResponse.data.message);
          }
        }
      } else {
        console.log(`❌ Ana menü oluşturulamadı: ${menuData.title}`);
        console.log("📋 Hata:", menuResponse.data.message);
      }

      console.log("");
    }

    console.log("🎉 Restoran menüsü ekleme tamamlandı!");
    console.log(`📊 Özet:`);
    console.log(`   📁 Ana Menü: ${progress.menus}`);
    console.log(`   📂 Kategori: ${progress.categories}`);
    console.log(`   🍽️  Ürün: ${progress.products}`);
    console.log("\n💡 Artık panelde restoran menünüzü görebilirsiniz!");
  } catch (error) {
    console.error("❌ Hata oluştu:", error.response?.data || error.message);
  }
}

// Script'i çalıştır
populateData();
