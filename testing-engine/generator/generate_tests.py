"""
Dynamic Test Case Generator
Fetches user interactions from the backend API and generates
ephemeral Selenium test cases. Tests are generated, run, and discarded.
"""
import os
import json
import requests
import textwrap

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:5000")
DYNAMIC_TEST_FILE = os.path.join(os.path.dirname(__file__), "..", "tests", "test_dynamic.py")


def fetch_interactions():
    """Fetch recent user interactions from the backend."""
    try:
        resp = requests.get(f"{BACKEND_URL}/api/interactions", timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException as e:
        print(f"Could not fetch interactions: {e}")
    return []


def generate_test_code(interactions):
    """Generate Python test code from user interactions."""
    if not interactions:
        return None

    test_functions = []

    for idx, interaction in enumerate(interactions[:5]):  # Max 5 dynamic tests
        url = interaction.get("url", "https://example.com")
        actions = interaction.get("actions", [])

        action_code_lines = []
        for action in actions:
            action_type = action.get("type", "")
            selector = action.get("selector", "")
            value = action.get("value", "")

            if action_type == "click" and selector:
                action_code_lines.append(
                    f'    driver.find_element(By.CSS_SELECTOR, "{selector}").click()'
                )
            elif action_type == "input" and selector and value:
                action_code_lines.append(
                    f'    el = driver.find_element(By.CSS_SELECTOR, "{selector}")'
                )
                action_code_lines.append(f'    el.clear()')
                action_code_lines.append(f'    el.send_keys("{value}")')
            elif action_type == "navigate" and action.get("url"):
                action_code_lines.append(f'    driver.get("{action["url"]}")')

        if not action_code_lines:
            action_code_lines = ['    pass  # No actionable interactions']

        actions_str = "\n".join(action_code_lines)
        test_functions.append(textwrap.dedent(f'''
def test_dynamic_interaction_{idx}(driver):
    """Auto-generated test from user interaction session."""
    driver.get("{url}")
{actions_str}
    assert driver.title, "Page should have a title after interactions"
'''))

    header = textwrap.dedent('''
"""
AUTO-GENERATED DYNAMIC TEST CASES
These tests are ephemeral - generated from user interactions, run once, then discarded.
"""
from selenium.webdriver.common.by import By
''')

    return header + "\n".join(test_functions)


def generate():
    """Main function: fetch interactions, generate test file."""
    interactions = fetch_interactions()

    if not interactions:
        print("No user interactions found. Skipping dynamic test generation.")
        # Write a placeholder so pytest doesn't complain
        with open(DYNAMIC_TEST_FILE, "w") as f:
            f.write('"""No dynamic tests generated."""\n')
        return False

    code = generate_test_code(interactions)
    if code:
        with open(DYNAMIC_TEST_FILE, "w") as f:
            f.write(code)
        print(f"Generated {len(interactions)} dynamic test(s) in {DYNAMIC_TEST_FILE}")
        return True

    return False


def cleanup():
    """Remove the dynamic test file after execution."""
    if os.path.exists(DYNAMIC_TEST_FILE):
        os.remove(DYNAMIC_TEST_FILE)
        print("Cleaned up dynamic test file.")


if __name__ == "__main__":
    generate()
