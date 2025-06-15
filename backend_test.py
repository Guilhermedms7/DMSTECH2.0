import requests
import json
import sys
from datetime import datetime

class DMSTechAPITester:
    def __init__(self, base_url="https://11ba861b-db50-4dc9-a5a2-6fd1c4bfbba6.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = "user123"  # Mock user ID as specified in the requirements

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the API health check endpoint"""
        return self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )

    def test_init_data(self):
        """Test the database initialization endpoint"""
        return self.run_test(
            "Initialize Database",
            "POST",
            "init-data",
            200
        )

    def test_get_all_products(self):
        """Test getting all products"""
        return self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )

    def test_get_featured_products(self):
        """Test getting featured products"""
        return self.run_test(
            "Get Featured Products",
            "GET",
            "products",
            200,
            params={"featured": "true"}
        )

    def test_get_sale_products(self):
        """Test getting products on sale"""
        return self.run_test(
            "Get Sale Products",
            "GET",
            "products",
            200,
            params={"on_sale": "true"}
        )

    def test_search_products(self, search_term):
        """Test product search functionality"""
        return self.run_test(
            f"Search Products ({search_term})",
            "GET",
            "products",
            200,
            params={"search": search_term}
        )

    def test_get_products_by_category(self, category):
        """Test getting products by category"""
        return self.run_test(
            f"Get Products by Category ({category})",
            "GET",
            "products",
            200,
            params={"category": category}
        )

    def test_get_categories(self):
        """Test getting all categories"""
        return self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )

    def test_add_to_cart(self, product_id):
        """Test adding a product to the cart"""
        return self.run_test(
            "Add to Cart",
            "POST",
            "cart",
            200,
            data={
                "user_id": self.user_id,
                "product_id": product_id,
                "quantity": 1
            }
        )

    def test_get_cart(self):
        """Test getting a user's cart"""
        return self.run_test(
            "Get User Cart",
            "GET",
            f"cart/{self.user_id}",
            200
        )

    def test_remove_from_cart(self, cart_item_id):
        """Test removing an item from the cart"""
        return self.run_test(
            "Remove from Cart",
            "DELETE",
            f"cart/{cart_item_id}",
            200
        )

def main():
    print("=" * 50)
    print("🧪 DMSTECH API Test Suite")
    print("=" * 50)
    
    # Initialize tester
    tester = DMSTechAPITester()
    
    # Run tests
    tester.test_health_check()
    tester.test_init_data()
    
    # Test product endpoints
    success, products_response = tester.test_get_all_products()
    if success and products_response:
        print(f"Found {len(products_response)} products")
        
        # Test featured products
        success, featured_products = tester.test_get_featured_products()
        if success:
            print(f"Found {len(featured_products)} featured products")
        
        # Test sale products
        success, sale_products = tester.test_get_sale_products()
        if success:
            print(f"Found {len(sale_products)} products on sale")
        
        # Test search functionality with multiple terms
        search_terms = ["RTX", "gaming", "mouse"]
        for term in search_terms:
            success, search_results = tester.test_search_products(term)
            if success:
                print(f"Search found {len(search_results)} products matching '{term}'")
        
        # Test category functionality
        success, categories_response = tester.test_get_categories()
        if success and "categories" in categories_response:
            categories = categories_response["categories"]
            print(f"Found {len(categories)} categories: {', '.join(categories)}")
            
            # Test getting products by each category
            for category in categories:
                success, category_products = tester.test_get_products_by_category(category)
                if success:
                    print(f"Found {len(category_products)} products in category '{category}'")
        
        # Test cart functionality
        if products_response and len(products_response) > 0:
            # Add multiple products to cart
            cart_item_ids = []
            for i in range(min(3, len(products_response))):
                product_id = products_response[i]["id"]
                print(f"Adding product ID to cart: {product_id}")
                success, cart_response = tester.test_add_to_cart(product_id)
                if success and "id" in cart_response:
                    cart_item_ids.append(cart_response["id"])
            
            # Get cart
            success, cart_items = tester.test_get_cart()
            if success:
                print(f"Found {len(cart_items)} items in user's cart")
                
                # Test removing items from cart
                if cart_items and len(cart_items) > 0:
                    cart_item_id = cart_items[0]["id"]
                    tester.test_remove_from_cart(cart_item_id)
                    
                    # Verify item was removed
                    success, updated_cart = tester.test_get_cart()
                    if success:
                        print(f"Cart now has {len(updated_cart)} items after removal")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print("=" * 50)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())