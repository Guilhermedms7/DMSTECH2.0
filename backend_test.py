import requests
import json
import sys
from datetime import datetime

class TechStoreAPITester:
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

    def test_search_products(self):
        """Test product search functionality"""
        return self.run_test(
            "Search Products (RTX)",
            "GET",
            "products",
            200,
            params={"search": "RTX"}
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

def main():
    print("=" * 50)
    print("🧪 TechStore API Test Suite")
    print("=" * 50)
    
    # Initialize tester
    tester = TechStoreAPITester()
    
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
        
        # Test search functionality
        success, search_results = tester.test_search_products()
        if success:
            print(f"Search found {len(search_results)} products matching 'RTX'")
        
        # Test cart functionality
        if products_response and len(products_response) > 0:
            product_id = products_response[0]["id"]
            print(f"Using product ID for cart test: {product_id}")
            
            # Add to cart
            tester.test_add_to_cart(product_id)
            
            # Get cart
            success, cart_items = tester.test_get_cart()
            if success:
                print(f"Found {len(cart_items)} items in user's cart")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print("=" * 50)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())