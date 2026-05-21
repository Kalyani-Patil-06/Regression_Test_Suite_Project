"""
Conftest.py - Shared fixtures for Selenium-based regression tests.
Uses webdriver-manager for automatic ChromeDriver setup.
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


import os

@pytest.fixture(scope="session")
def driver():
    """Create a shared Chrome WebDriver instance for the test session."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    # On Render (Linux), use the installed chromium-driver. Locally, use webdriver-manager.
    if os.path.exists("/usr/bin/chromedriver"):
        service = Service("/usr/bin/chromedriver")
        chrome_options.binary_location = "/usr/bin/chromium"
    else:
        service = Service(ChromeDriverManager().install())
        
    browser = webdriver.Chrome(service=service, options=chrome_options)
    browser.implicitly_wait(10)

    yield browser

    browser.quit()


@pytest.fixture
def fresh_driver():
    """Create a fresh Chrome WebDriver for individual tests that need isolation."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    if os.path.exists("/usr/bin/chromedriver"):
        service = Service("/usr/bin/chromedriver")
        chrome_options.binary_location = "/usr/bin/chromium"
    else:
        service = Service(ChromeDriverManager().install())
        
    browser = webdriver.Chrome(service=service, options=chrome_options)
    browser.implicitly_wait(10)

    yield browser

    browser.quit()
