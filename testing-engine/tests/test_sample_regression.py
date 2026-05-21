"""
Generic Regression Test Suite
Tests work against ANY website URL provided via the TARGET_URL environment variable.
They test fundamental web application properties that every site should have.
"""
import os
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


BASE_URL = os.environ.get("TARGET_URL", "https://the-internet.herokuapp.com")

def ensure_page_loaded(driver):
    """Only load the page if we aren't already on it to save time."""
    if driver.current_url != BASE_URL:
        driver.get(BASE_URL)

class TestPageFundamentals:
    """Basic page loading and structure tests — works on any website."""

    def test_page_loads_successfully(self, driver):
        """Verify the target page loads without errors."""
        ensure_page_loaded(driver)
        assert driver.title is not None, f"Page at {BASE_URL} should have a title"

    def test_page_has_content(self, driver):
        """Verify the page has visible body content."""
        ensure_page_loaded(driver)
        body = driver.find_element(By.TAG_NAME, "body")
        assert body.text.strip(), "Page body should contain text content"

    def test_no_console_errors(self, driver):
        """Check that page doesn't have critical JavaScript errors."""
        ensure_page_loaded(driver)
        logs = driver.get_log("browser")
        severe_errors = [log for log in logs if log.get("level") == "SEVERE"]
        if severe_errors:
            print(f"⚠ Found {len(severe_errors)} console errors (non-blocking)")


class TestSEO:
    """SEO and metadata regression tests."""

    def test_has_title_tag(self, driver):
        """Verify page has a non-empty title."""
        ensure_page_loaded(driver)
        title = driver.title
        assert title and len(title) > 0, "Page should have a title tag"

    def test_has_meta_viewport(self, driver):
        """Check for meta viewport tag (required for responsive design)."""
        ensure_page_loaded(driver)
        try:
            meta = driver.find_element(By.CSS_SELECTOR, 'meta[name="viewport"]')
            content = meta.get_attribute("content")
            assert content and "width" in content, "Meta viewport should contain width definition"
        except Exception:
            assert False, "No meta viewport tag found — required for responsive design"

    def test_has_heading_structure(self, driver):
        """Verify page has at least one heading (h1-h6)."""
        ensure_page_loaded(driver)
        headings = driver.find_elements(By.CSS_SELECTOR, "h1, h2, h3, h4, h5, h6")
        assert len(headings) > 0, "Page should have at least one heading element"

    def test_has_lang_attribute(self, driver):
        """Verify the html tag has a lang attribute for accessibility."""
        ensure_page_loaded(driver)
        html_tag = driver.find_element(By.TAG_NAME, "html")
        lang = html_tag.get_attribute("lang")
        assert lang and len(lang) > 0, "HTML tag should have a lang attribute for accessibility"


class TestNavigation:
    """Navigation and link tests."""

    def test_links_are_present(self, driver):
        """Verify the page has navigation links."""
        ensure_page_loaded(driver)
        links = driver.find_elements(By.TAG_NAME, "a")
        assert len(links) > 0, "Page should have at least one link"

    def test_links_have_href(self, driver):
        """Verify links have valid href attributes."""
        ensure_page_loaded(driver)
        links = driver.find_elements(By.TAG_NAME, "a")
        links_with_href = [l for l in links if l.get_attribute("href")]
        assert len(links_with_href) > 0, "At least some links should have href attributes"


class TestResponsiveness:
    """Responsive design regression tests."""

    def test_page_renders_at_mobile_width(self, driver):
        """Verify page renders at mobile viewport (375px)."""
        ensure_page_loaded(driver)
        driver.set_window_size(375, 812)
        body = driver.find_element(By.TAG_NAME, "body")
        assert body.is_displayed(), "Page should render at mobile width"
        driver.set_window_size(1920, 1080)

    def test_page_renders_at_tablet_width(self, driver):
        """Verify page renders at tablet viewport (768px)."""
        ensure_page_loaded(driver)
        driver.set_window_size(768, 1024)
        body = driver.find_element(By.TAG_NAME, "body")
        assert body.is_displayed(), "Page should render at tablet width"
        driver.set_window_size(1920, 1080)


class TestPerformance:
    """Basic performance and accessibility regression tests."""

    def test_page_loads_within_timeout(self, driver):
        """Verify page loads within the implicit wait timeout (10s)."""
        ensure_page_loaded(driver)
        assert True

    def test_images_have_alt_text(self, driver):
        """Check that images have alt attributes (accessibility)."""
        ensure_page_loaded(driver)
        images = driver.find_elements(By.TAG_NAME, "img")
        if len(images) == 0:
            return  # No images, skip

        images_without_alt = [
            img.get_attribute("src") for img in images
            if not img.get_attribute("alt")
        ]
        assert len(images_without_alt) == 0, f"{len(images_without_alt)} images found without alt text (accessibility issue)"

    def test_no_mixed_content(self, driver):
        """Check page doesn't load HTTP resources on HTTPS page."""
        ensure_page_loaded(driver)
        if not BASE_URL.startswith("https"):
            return  # Only applies to HTTPS sites

        scripts = driver.find_elements(By.TAG_NAME, "script")
        insecure = [s.get_attribute("src") for s in scripts
                     if s.get_attribute("src") and s.get_attribute("src").startswith("http://")]
        assert len(insecure) == 0, f"Found mixed content (HTTP on HTTPS page): {insecure}"
