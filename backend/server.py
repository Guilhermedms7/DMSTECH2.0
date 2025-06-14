from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Product Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    subcategory: str
    brand: str
    image_url: str
    images: List[str] = []
    specifications: dict = {}
    stock: int = 0
    rating: float = 0.0
    review_count: int = 0
    featured: bool = False
    on_sale: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    subcategory: str
    brand: str
    image_url: str
    images: List[str] = []
    specifications: dict = {}
    stock: int = 0
    featured: bool = False
    on_sale: bool = False

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    quantity: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CartItemCreate(BaseModel):
    user_id: str
    product_id: str
    quantity: int = 1

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

# Initialize sample products
sample_products = [
    {
        "name": "RTX 4090 Gaming X Trio",
        "description": "Placa de vídeo NVIDIA GeForce RTX 4090 com 24GB GDDR6X. Perfeita para gaming em 4K e Ray Tracing.",
        "price": 12999.99,
        "original_price": 14999.99,
        "category": "Componentes",
        "subcategory": "Placas de Vídeo",
        "brand": "MSI",
        "image_url": "https://images.unsplash.com/photo-1555618568-bdf0a992c512?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxncmFwaGljcyUyMGNhcmR8ZW58MHx8fHwxNzQ5OTQwNzk0fDA&ixlib=rb-4.1.0&q=85",
        "images": ["https://images.unsplash.com/photo-1555618568-bdf0a992c512?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxncmFwaGljcyUyMGNhcmR8ZW58MHx8fHwxNzQ5OTQwNzk0fDA&ixlib=rb-4.1.0&q=85"],
        "specifications": {
            "GPU": "NVIDIA GeForce RTX 4090",
            "Memoria": "24GB GDDR6X",
            "Interface": "PCI Express 4.0",
            "Boost Clock": "2230 MHz"
        },
        "stock": 5,
        "rating": 4.8,
        "review_count": 127,
        "featured": True,
        "on_sale": True
    },
    {
        "name": "PC Gamer RGB Master",
        "description": "PC Gamer completo com RGB, Intel i7, RTX 4070, 32GB RAM, SSD 1TB. Pronto para qualquer jogo!",
        "price": 8999.99,
        "category": "Computadores",
        "subcategory": "PC Gamer",
        "brand": "Custom Build",
        "image_url": "https://images.unsplash.com/photo-1622013378145-e8d89cfbd990?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBQQ3xlbnwwfHx8fDE3NDk5NDA3OTh8MA&ixlib=rb-4.1.0&q=85",
        "images": ["https://images.unsplash.com/photo-1622013378145-e8d89cfbd990?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBQQ3xlbnwwfHx8fDE3NDk5NDA3OTh8MA&ixlib=rb-4.1.0&q=85"],
        "specifications": {
            "Processador": "Intel Core i7-13700K",
            "Placa de Video": "RTX 4070",
            "Memoria": "32GB DDR4",
            "Armazenamento": "SSD 1TB NVMe"
        },
        "stock": 3,
        "rating": 4.9,
        "review_count": 89,
        "featured": True,
        "on_sale": False
    },
    {
        "name": "Mouse Gamer RGB Pro",
        "description": "Mouse gamer com RGB customizável, 12000 DPI, botões programáveis e design ergonômico.",
        "price": 299.99,
        "original_price": 399.99,
        "category": "Periféricos",
        "subcategory": "Mouses",
        "brand": "HyperX",
        "image_url": "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg",
        "images": ["https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg"],
        "specifications": {
            "DPI": "12000",
            "Botoes": "6 botões programáveis",
            "Conectividade": "USB",
            "RGB": "Sim"
        },
        "stock": 25,
        "rating": 4.6,
        "review_count": 234,
        "featured": False,
        "on_sale": True
    },
    {
        "name": "Teclado Mecânico RGB",
        "description": "Teclado mecânico com switches Cherry MX Blue, RGB individual das teclas e layout ABNT2.",
        "price": 799.99,
        "category": "Periféricos",
        "subcategory": "Teclados",
        "brand": "Corsair",
        "image_url": "https://images.pexels.com/photos/1309766/pexels-photo-1309766.jpeg",
        "images": ["https://images.pexels.com/photos/1309766/pexels-photo-1309766.jpeg"],
        "specifications": {
            "Switches": "Cherry MX Blue",
            "Layout": "ABNT2",
            "RGB": "Per-key RGB",
            "Conectividade": "USB-C"
        },
        "stock": 15,
        "rating": 4.7,
        "review_count": 156,
        "featured": True,
        "on_sale": False
    },
    {
        "name": "Monitor Gamer 27\" 144Hz",
        "description": "Monitor gamer curvo 27 polegadas, 144Hz, 1ms, FreeSync Premium, QHD 2560x1440.",
        "price": 1899.99,
        "original_price": 2299.99,
        "category": "Monitores",
        "subcategory": "Gaming",
        "brand": "Samsung",
        "image_url": "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
        "images": ["https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"],
        "specifications": {
            "Tamanho": "27 polegadas",
            "Resolucao": "2560x1440 (QHD)",
            "Taxa de Atualizacao": "144Hz",
            "Tempo de Resposta": "1ms"
        },
        "stock": 8,
        "rating": 4.8,
        "review_count": 98,
        "featured": True,
        "on_sale": True
    },
    {
        "name": "Headset Gamer Wireless",
        "description": "Headset gamer sem fio com som surround 7.1, cancelamento de ruído e RGB.",
        "price": 599.99,
        "category": "Periféricos",
        "subcategory": "Headsets",
        "brand": "SteelSeries",
        "image_url": "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg",
        "images": ["https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg"],
        "specifications": {
            "Som": "Surround 7.1",
            "Conectividade": "Wireless 2.4GHz",
            "Bateria": "20 horas",
            "RGB": "Sim"
        },
        "stock": 12,
        "rating": 4.5,
        "review_count": 203,
        "featured": False,
        "on_sale": False
    }
]

# Routes
@api_router.get("/")
async def root():
    return {"message": "TechStore API v1.0"}

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    on_sale: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    filter_dict = {}
    
    if category:
        filter_dict["category"] = category
    if featured is not None:
        filter_dict["featured"] = featured
    if on_sale is not None:
        filter_dict["on_sale"] = on_sale
    if search:
        filter_dict["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(filter_dict).limit(limit).to_list(limit)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.post("/cart", response_model=CartItem)
async def add_to_cart(cart_item: CartItemCreate):
    # Check if item already exists in cart
    existing_item = await db.cart.find_one({
        "user_id": cart_item.user_id,
        "product_id": cart_item.product_id
    })
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item["quantity"] + cart_item.quantity
        await db.cart.update_one(
            {"id": existing_item["id"]},
            {"$set": {"quantity": new_quantity}}
        )
        existing_item["quantity"] = new_quantity
        return CartItem(**existing_item)
    else:
        # Create new cart item
        cart_dict = cart_item.dict()
        cart_obj = CartItem(**cart_dict)
        await db.cart.insert_one(cart_obj.dict())
        return cart_obj

@api_router.get("/cart/{user_id}", response_model=List[CartItem])
async def get_cart(user_id: str):
    cart_items = await db.cart.find({"user_id": user_id}).to_list(100)
    return [CartItem(**item) for item in cart_items]

@api_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: str):
    result = await db.cart.delete_one({"id": cart_item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return {"categories": categories}

# Initialize database with sample data
@api_router.post("/init-data")
async def init_data():
    # Check if products already exist
    existing_count = await db.products.count_documents({})
    if existing_count > 0:
        return {"message": "Database already initialized"}
    
    # Insert sample products
    products_to_insert = []
    for product_data in sample_products:
        product_obj = Product(**product_data)
        products_to_insert.append(product_obj.dict())
    
    await db.products.insert_many(products_to_insert)
    return {"message": f"Initialized database with {len(products_to_insert)} products"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,  
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()