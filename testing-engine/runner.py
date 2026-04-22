"""
Test Runner - Executes pytest and outputs JSON results.
Called by the Node.js backend via child_process.
Outputs a JSON object with test results to stdout.
"""
import subprocess
import json
import sys
import os


def run_tests():
    """Run pytest and return structured JSON results."""
    test_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tests")
    report_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".test_report.json")

    # Run pytest with JSON report
    try:
        result = subprocess.run(
            [
                sys.executable, "-m", "pytest",
                test_dir,
                "-v",
                "--tb=short",
                "--json-report",
                f"--json-report-file={report_file}",
                "--json-report-indent=2",
                "--ignore=" + os.path.join(test_dir, "__pycache__"),
            ],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
    except subprocess.TimeoutExpired:
        output = {
            "total": 0,
            "passed": 0,
            "failed": 1,
            "skipped": 0,
            "results": [{
                "testName": "Test Suite",
                "status": "error",
                "duration": 120,
                "errorMessage": "Test execution timed out after 120 seconds"
            }]
        }
        print(json.dumps(output))
        return

    # Parse results
    results = []
    total = 0
    passed_count = 0
    failed_count = 0
    skipped_count = 0

    if os.path.exists(report_file):
        try:
            with open(report_file, "r") as f:
                report = json.load(f)

            summary = report.get("summary", {})
            total = summary.get("total", 0)
            passed_count = summary.get("passed", 0)
            failed_count = summary.get("failed", 0)
            skipped_count = summary.get("skipped", 0)

            for test in report.get("tests", []):
                test_result = {
                    "testName": test.get("nodeid", "unknown"),
                    "status": test.get("outcome", "error"),
                    "duration": round(test.get("duration", 0), 3),
                    "errorMessage": ""
                }

                # Extract error message if failed
                call_info = test.get("call", {})
                if call_info.get("crash"):
                    test_result["errorMessage"] = call_info["crash"].get("message", "")
                elif call_info.get("longrepr"):
                    test_result["errorMessage"] = str(call_info["longrepr"])[:500]

                results.append(test_result)

            # Cleanup report file
            os.remove(report_file)
        except Exception as e:
            print(f"Error parsing report: {e}", file=sys.stderr)

    # If no report file was generated, parse from pytest stdout/stderr
    if not results:
        total = 1
        if result.returncode == 0:
            passed_count = 1
            results = [{"testName": "Test Suite", "status": "passed", "duration": 0, "errorMessage": ""}]
        else:
            failed_count = 1
            error_msg = result.stderr[:500] if result.stderr else result.stdout[:500]
            results = [{
                "testName": "Test Suite",
                "status": "failed",
                "duration": 0,
                "errorMessage": error_msg
            }]

    # Output JSON to stdout (picked up by Node.js backend)
    output = {
        "total": total,
        "passed": passed_count,
        "failed": failed_count,
        "skipped": skipped_count,
        "results": results
    }

    print(json.dumps(output))


if __name__ == "__main__":
    run_tests()
