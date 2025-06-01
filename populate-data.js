const axios = require("axios");

// API Base URL
const API_BASE_URL = "https://jovial-bouman.104-247-167-194.plesk.page";

// JWT Token'ını buraya yapıştır (tarayıcıdan Application -> Cookies -> authToken)
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImVlNGYwZDkxLTQ3MWMtNGU3Yi1iYTY4LTMyNGZiOTk0MWE1OCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6InNvcmFsZmF0aWgzQGdtYWlsLmNvbSIsImp0aSI6IjEwNmMxM2M3LTk3MzAtNDU5MS04OWY4LWM4NGU4OTY3NTJmZCIsImlhdCI6IjYvMS8yMDI1IDEyOjEzOjI2IEFNIiwiZXhwIjoxNzQ4NzQ0MDA2LCJpc3MiOiJRck1lbnUuQVBJLklzc3VlciIsImF1ZCI6IlFyTWVudS5BUEkuQXVkaWVuY2UifQ.2dz8qpH6ryMt3A4sm6_9oBYWPKDS1lrqtMgvhJ6PuNk";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${JWT_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Türk Mutfağı Dataset
const dataset = {
  menus: [
    {
      title: "Ana Yemekler",
      description: "Geleneksel Türk mutfağının en sevilen ana yemekleri",
      imageUrl:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
      language: "tr",
      categories: [
        {
          name: "Kebaplar",
          description: "Mangalda pişirilen nefis kebap çeşitleri",
          imageUrl:
            "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400",
          products: [
            {
              name: "Adana Kebap",
              description: "Acılı kıyma kebabı, közlenmiş domates ve biber ile",
              price: 85.0,
              imageUrl:
                "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300",
            },
            {
              name: "Urfa Kebap",
              description: "Acısız kıyma kebabı, pilav ve salata ile",
              price: 80.0,
              imageUrl:
                "https://images.unsplash.com/photo-1574653163985-beeea5e5525e?w=300",
            },
            {
              name: "Şiş Kebap",
              description: "Marine edilmiş kuzu eti şişte pişirilir",
              price: 95.0,
              imageUrl:
                "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300",
            },
            {
              name: "İskender Kebap",
              description: "Döner eti, yoğurt ve tereyağlı sos ile",
              price: 110.0,
              imageUrl:
                "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300",
            },
          ],
        },
        {
          name: "Dönerler",
          description: "Taze et döner çeşitleri",
          imageUrl:
            "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400",
          products: [
            {
              name: "Et Döner",
              description: "Taze kuzu eti döner, lavash ekmek ile",
              price: 65.0,
              imageUrl:
                "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300",
            },
            {
              name: "Tavuk Döner",
              description: "Marine edilmiş tavuk döner",
              price: 55.0,
              imageUrl:
                "https://images.unsplash.com/photo-1619740455993-a195d5e91be3?w=300",
            },
            {
              name: "Karışık Döner",
              description: "Et ve tavuk döner karışımı",
              price: 70.0,
              imageUrl:
                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300",
            },
          ],
        },
        {
          name: "Pideler",
          description: "Fırında pişirilen özel pideler",
          imageUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
          products: [
            {
              name: "Kıymalı Pide",
              description: "Taze kıyma, domates, biber ile",
              price: 45.0,
              imageUrl:
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300",
            },
            {
              name: "Peynirli Pide",
              description: "Özel peynir karışımı ile",
              price: 40.0,
              imageUrl:
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300",
            },
            {
              name: "Karışık Pide",
              description: "Kıyma, peynir, sucuk karışımı",
              price: 50.0,
              imageUrl:
                "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=300",
            },
            {
              name: "Sucuklu Pide",
              description: "Sucuk ve kaşar peyniri ile",
              price: 48.0,
              imageUrl:
                "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=300",
            },
          ],
        },
      ],
    },
    {
      title: "Başlangıçlar",
      description: "Nefis başlangıç lezzetleri ve mezeler",
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
      language: "tr",
      categories: [
        {
          name: "Çorbalar",
          description: "Geleneksel Türk çorba çeşitleri",
          imageUrl:
            "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
          products: [
            {
              name: "Mercimek Çorbası",
              description: "Kırmızı mercimek, havuç, soğan ile",
              price: 25.0,
              imageUrl:
                "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300",
            },
            {
              name: "Yayla Çorbası",
              description: "Yoğurt, pirinç ve nane ile",
              price: 28.0,
              imageUrl:
                "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=300",
            },
            {
              name: "Tarhana Çorbası",
              description: "Geleneksel tarhana ile",
              price: 30.0,
              imageUrl:
                "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300",
            },
            {
              name: "Ezogelin Çorbası",
              description: "Kırmızı mercimek ve bulgur ile",
              price: 27.0,
              imageUrl:
                "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=300",
            },
          ],
        },
        {
          name: "Mezeler",
          description: "Soğuk ve sıcak meze çeşitleri",
          imageUrl:
            "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400",
          products: [
            {
              name: "Humus",
              description: "Nohut ezmesi, tahin ve zeytinyağı ile",
              price: 30.0,
              imageUrl:
                "https://images.unsplash.com/photo-1571197119669-89af5d86f557?w=300",
            },
            {
              name: "Haydari",
              description: "Süzme yoğurt, sarımsak ve dereotu ile",
              price: 25.0,
              imageUrl:
                "https://images.unsplash.com/photo-1625937329935-d5e03e3a77ae?w=300",
            },
            {
              name: "Sigara Böreği",
              description: "İnce yufka, peynir ve maydanoz ile",
              price: 35.0,
              imageUrl:
                "https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=300",
            },
            {
              name: "Çiğ Köfte",
              description: "Bulgur, domates salçası ve baharatlar ile",
              price: 32.0,
              imageUrl:
                "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300",
            },
            {
              name: "Acılı Ezme",
              description: "Domates, biber, soğan ve baharatlar",
              price: 28.0,
              imageUrl:
                "https://images.unsplash.com/photo-1571197119669-89af5d86f557?w=300",
            },
          ],
        },
        {
          name: "Salatalar",
          description: "Taze ve besleyici salata çeşitleri",
          imageUrl:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
          products: [
            {
              name: "Çoban Salata",
              description: "Domates, salatalık, soğan, maydanoz",
              price: 20.0,
              imageUrl:
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300",
            },
            {
              name: "Mevsim Salata",
              description: "Mevsimlik yeşillikler ve sebzeler",
              price: 25.0,
              imageUrl:
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300",
            },
            {
              name: "Rokalı Salata",
              description: "Roka, domates, parmesan peyniri",
              price: 35.0,
              imageUrl:
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300",
            },
          ],
        },
      ],
    },
    {
      title: "Tatlılar",
      description: "Geleneksel Türk tatlıları ve modern lezzetler",
      imageUrl:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
      language: "tr",
      categories: [
        {
          name: "Şerbetli Tatlılar",
          description: "Şerbetli geleneksel tatlılar",
          imageUrl:
            "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400",
          products: [
            {
              name: "Baklava",
              description: "Cevizli, fıstıklı baklava çeşitleri",
              price: 45.0,
              imageUrl:
                "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300",
            },
            {
              name: "Şöbiyet",
              description: "Krema ve fıstıklı özel tatlı",
              price: 40.0,
              imageUrl:
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300",
            },
            {
              name: "Tulumba",
              description: "Şerbetli hamur tatlısı",
              price: 35.0,
              imageUrl:
                "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300",
            },
          ],
        },
        {
          name: "Sütlü Tatlılar",
          description: "Sütlü ve kremalı tatlı çeşitleri",
          imageUrl:
            "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
          products: [
            {
              name: "Sütlaç",
              description: "Geleneksel fırın sütlacı",
              price: 30.0,
              imageUrl:
                "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300",
            },
            {
              name: "Muhallebi",
              description: "Tarçın ve fıstık ile",
              price: 25.0,
              imageUrl:
                "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300",
            },
            {
              name: "Kazandibi",
              description: "Karamelize edilmiş süt tatlısı",
              price: 32.0,
              imageUrl:
                "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300",
            },
          ],
        },
        {
          name: "Dondurma",
          description: "El yapımı dondurma çeşitleri",
          imageUrl:
            "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400",
          products: [
            {
              name: "Vanilya Dondurma",
              description: "Klasik vanilya aromalı",
              price: 20.0,
              imageUrl:
                "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300",
            },
            {
              name: "Çikolata Dondurma",
              description: "Yoğun çikolata lezzeti",
              price: 22.0,
              imageUrl:
                "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300",
            },
            {
              name: "Çilekli Dondurma",
              description: "Taze çilek aromalı",
              price: 21.0,
              imageUrl:
                "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300",
            },
          ],
        },
      ],
    },
    {
      title: "İçecekler",
      description: "Sıcak ve soğuk içecek çeşitleri",
      imageUrl:
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800",
      language: "tr",
      categories: [
        {
          name: "Sıcak İçecekler",
          description: "Çay, kahve ve sıcak içecekler",
          imageUrl:
            "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
          products: [
            {
              name: "Türk Çayı",
              description: "Geleneksel çay demleme",
              price: 8.0,
              imageUrl:
                "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300",
            },
            {
              name: "Türk Kahvesi",
              description: "Ateşte pişirilen geleneksel kahve",
              price: 15.0,
              imageUrl:
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300",
            },
            {
              name: "Salep",
              description: "Tarçınlı sıcak salep",
              price: 18.0,
              imageUrl:
                "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300",
            },
          ],
        },
        {
          name: "Soğuk İçecekler",
          description: "Serinletici soğuk içecekler",
          imageUrl:
            "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400",
          products: [
            {
              name: "Ayran",
              description: "Geleneksel yoğurt içeceği",
              price: 12.0,
              imageUrl:
                "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=300",
            },
            {
              name: "Şalgam",
              description: "Acılı şalgam suyu",
              price: 10.0,
              imageUrl:
                "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=300",
            },
            {
              name: "Limonata",
              description: "Taze limon ile",
              price: 15.0,
              imageUrl:
                "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=300",
            },
            {
              name: "Kola",
              description: "Soğuk kola",
              price: 12.0,
              imageUrl:
                "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=300",
            },
          ],
        },
      ],
    },
    {
      title: "Kahvaltı",
      description: "Zengin kahvaltı seçenekleri",
      imageUrl:
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
      language: "tr",
      categories: [
        {
          name: "Türk Kahvaltısı",
          description: "Geleneksel Türk kahvaltı lezzetleri",
          imageUrl:
            "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
          products: [
            {
              name: "Serpme Kahvaltı",
              description: "Peynir, zeytin, yumurta, sucuk, börek çeşitleri",
              price: 85.0,
              imageUrl:
                "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300",
            },
            {
              name: "Sade Kahvaltı",
              description: "Peynir, zeytin, yumurta, domates, salatalık",
              price: 45.0,
              imageUrl:
                "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300",
            },
            {
              name: "Köy Kahvaltısı",
              description: "Köy peyniri, köy tereyağı, bal, kaymak",
              price: 65.0,
              imageUrl:
                "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300",
            },
          ],
        },
        {
          name: "Omletler",
          description: "Çeşitli omlet türleri",
          imageUrl:
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
          products: [
            {
              name: "Sade Omlet",
              description: "Klasik yumurta omleti",
              price: 25.0,
              imageUrl:
                "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300",
            },
            {
              name: "Peynirli Omlet",
              description: "Kaşar peyniri ile",
              price: 30.0,
              imageUrl:
                "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300",
            },
            {
              name: "Sucuklu Omlet",
              description: "Sucuk parçaları ile",
              price: 35.0,
              imageUrl:
                "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300",
            },
            {
              name: "Karışık Omlet",
              description: "Sebze, peynir ve sucuk ile",
              price: 40.0,
              imageUrl:
                "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300",
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
    console.log("🚀 Veri ekleme başlıyor...\n");

    if (JWT_TOKEN === "BURAYA_JWT_TOKEN_YAPISTIR") {
      console.error(
        "❌ JWT Token eksik! Lütfen script'te JWT_TOKEN değişkenini düzenleyin."
      );
      return;
    }

    // Token'dan user ID'sini çıkar
    const tokenParts = JWT_TOKEN.split(".");
    const tokenPayload = JSON.parse(atob(tokenParts[1]));
    const userId =
      tokenPayload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];

    console.log("👤 User ID:", userId);

    for (const menuData of dataset.menus) {
      console.log(`📁 Ana menü oluşturuluyor: ${menuData.title}`);

      // Ana menü oluştur - API'nin beklediği format
      const menuPayload = {
        name: menuData.title, // title yerine name
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

        await delay(500); // API'yi yormamak için bekle

        // Kategorileri oluştur
        for (const categoryData of menuData.categories) {
          console.log(`  📂 Kategori oluşturuluyor: ${categoryData.name}`);

          // Kategori payload'ı
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

              // Ürün payload'ı
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

      console.log(""); // Boş satır
    }

    console.log("🎉 Veri ekleme tamamlandı!");
    console.log(`📊 Özet:`);
    console.log(`   📁 Ana Menü: ${progress.menus}`);
    console.log(`   📂 Kategori: ${progress.categories}`);
    console.log(`   🍽️  Ürün: ${progress.products}`);
    console.log("\n💡 Artık panelde tüm verileri görebilirsiniz!");
  } catch (error) {
    console.error("❌ Hata oluştu:", error.response?.data || error.message);
  }
}

// Script'i çalıştır
populateData();
