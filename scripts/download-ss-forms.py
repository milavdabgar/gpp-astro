#!/usr/bin/env python3
import urllib.request, os

dest = os.path.join(os.path.dirname(__file__), "..", "public", "docs", "ss-forms")
os.makedirs(dest, exist_ok=True)

files = [
    # Already downloaded (skip if exists)
    ("1Bp80lBTTEvy6g2wk1saXhWc87khgflCi", "duplicate-marksheet-procedure.pdf"),
    ("1wmReIlQpy-_VSQNz5S0XyMHTRImbKl8A", "bonafide-certificate-application.pdf"),
    ("1y6inVtSQ5a0qo-CFD0ly5L_evuO0m0et", "self-declaration-scholarship.pdf"),
    ("1cOiiDuK1zzd4q4y-FFGZVuN-btJxpfGw", "digital-gujarat-scholarship-notice-2025-26.pdf"),
    ("1WsBC1m8CnkoDwy7ij4oQ4ivQl2YNw1C-", "scholarship-form-filling-guideline.pdf"),
    ("1EuE5L4O7McAbSRN_tbu4n_k5tlx02UiN", "sebc-scholarship-guideline-2025-26.pdf"),
    ("18I_xAmQCIiUmghTvDMnzEwN0XhiWWG1V", "fee-refund-application.pdf"),
    ("1OzfrwNpK9sfywHletyKFl1sPmjhL-oyA", "semester-fee-request.pdf"),
    ("18FeAEK82RQMTed43FFqcokaFJB5Xcdn-", "admission-cancellation-application.pdf"),
    ("1jBfuVjQarA-Sg-bMEfdjBXaYg0p1sBlO", "admission-cancellation-noc.pdf"),
    ("1lzV4pqeApTIRHFpGqPihvsZlZnbN2RSy", "gtu-admission-cancellation-circular.pdf"),
    ("1pFiZureFQvbuLQXut9399cdF7eCx_qaD", "institute-transfer-form-namnoo1.pdf"),
    ("1pCvY8BMt30vXGw4lBkFN7Mw8REsC1cO1", "g2g-transfer-manual.pdf"),
    ("1krQFWKkTlUd7cs8xD272ZpR14ux-nCD9", "duplicate-icard-application.pdf"),
    ("16G81LGy9scuWYhzFxcibcEl9Z64Mhy2i", "student-icard-format.pdf"),
    ("1jfHaOxz1kkrls-qfOG2_ceOSjIqTOrKU", "faculty-staff-icard-format.pdf"),
    # Notices used in index.astro
    ("1mxFw9s1148JYSVa93NO_Pd83NgWCFxeH", "notice-scholarship-sebc-sc-2024-25.pdf"),
    ("1XPQvW1fGoMEAya8qyevMuy7tms694xvP", "notice-scholarship-st-2024-25.pdf"),
    ("1bYylg7KSNk1fbsS7xD8eM0CgrSMjltVX", "notice-scholarship-sc-reopen-2022-24.pdf"),
    ("1altZ6JGgWwNR3GMrFgr7E-Ly4oVr9Zp_", "notice-digital-gujarat-scholarship-2024-25.pdf"),
    ("1WXrzccfvTXaiMMzlF2KOilmREzh_ndOs", "notice-aicte-swanath-2024-25.pdf"),
    ("1UelxXIthYqzHXExnZfwpivhgP6-YxihO", "notice-aicte-saksham-2024-25.pdf"),
    ("1pGI8_K9BPww25NZA2uSS9gntLI_btGNk", "notice-aicte-pragati-2024-25.pdf"),
    ("1OUjAAyBJBjTXm7kr0_-GGe0oCpnAKeGU", "notice-fee-collection-summer-2024.pdf"),
    # TEB docs
    ("17IwhhdVGqmq-6tXVYdDQ4U9PCWS3B7V1", "teb-documents-guideline.pdf"),
    ("1LLR59vgkg8uQzA1aAxag-3eEhJa2zTHC", "teb-instruction-sheet.pdf"),
    # NBA
    ("1LM8qOrY7ox7UbOVpcDdo_B9E0cgPqjy7", "nba-accreditation-2021-22.pdf"),
    ("1hC4qpnJURjIFtTgOmHt6jOL8uwC3qd6C", "nba-accreditation-2024-25.pdf"),
    # Committee
    ("1OFnlTq4UnlFVv0N_qcygUElGGtxJjRpu", "student-section-committee.pdf"),
]

headers = {"User-Agent": "Mozilla/5.0"}

for fid, fname in files:
    path = os.path.join(dest, fname)
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        print(f"SKIP {fname}")
        continue
    url = f"https://drive.usercontent.google.com/download?id={fid}&export=download&authuser=0&confirm=t"
    path = os.path.join(dest, fname)
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
        with open(path, "wb") as f:
            f.write(data)
        # Basic check: PDF magic bytes
        status = "OK " if data[:4] == b"%PDF" else "WARN (not PDF?)"
        print(f"{status}  {fname}  ({len(data):,} bytes)")
    except Exception as e:
        print(f"ERR  {fname}: {e}")
