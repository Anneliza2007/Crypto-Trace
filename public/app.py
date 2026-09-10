"""
CryptoTrace - Automated Crypto Wallet Tracing Prototype
Single-file self-contained Streamlit Application
Run with: streamlit run app.py
"""

import streamlit as st
from collections import deque
import matplotlib.pyplot as plt
import networkx as nx
from io import BytesIO
from datetime import datetime

# Page configuration
st.set_page_config(
    page_title="CryptoTrace - Automated Crypto Wallet Tracing",
    page_icon="🔍",
    layout="wide"
)

# ---------------------------------------------------------
# SECTION 4: About This Prototype
# ---------------------------------------------------------
st.title("🔍 CryptoTrace: Automated Crypto Wallet Tracing")
st.caption("Hackathon Demonstration Prototype for On-Chain Forensic BFS Tracing & BNSS Compliance")

with st.expander("ℹ️ About This Prototype", expanded=True):
    st.markdown("""
    - **Simulated Transaction Graph**: Uses a deterministic in-memory blockchain graph to demonstrate automated multi-hop BFS (Breadth-First Search) tracing without requiring third-party API quotas.
    - **Production Architecture**: In production, real-time transaction DAGs are ingested via **Blockstream Esplora** / RPC nodes and indexed into **Neo4j** graph databases for sub-second multi-billion edge pathfinding.
    - **Regulatory Actionability**: Generates an instantaneous freezing requisition under **Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023** addressed to identified Virtual Asset Service Providers (VASPs).
    """)

# ---------------------------------------------------------
# SECTION 2: Sample Blockchain Dataset
# ---------------------------------------------------------
WALLETS = {
    "0x71C839a9bF32D15781a704e19B64aF38A1552F1": {
        "label": "Suspect Root (Ransomware Drainer)",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x3A9F82dE77114Ac076a9D91834f890A9214441B": {
        "label": "Intermediary Mule Layer-1",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x91F22C51a99A045bD61066B8e239eBc898842": {
        "label": "Decoy Pass-through",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x44D7A144e05b9fB4F3218776ca1a94cD190C3": {
        "label": "Mixer Peel Address Layer-2",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x12E55Be38466cc0455Bf11904a25c6020031": {
        "label": "Dead-end Decoy (Unmoved)",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x88C31Dc611B291Af00b651Fe4c19412A511AE": {
        "label": "Consolidator Mule Layer-3",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x67B49EeB93466a9d7B41527Fc090334889": {
        "label": "Stagnant Split Wallet (Decoy)",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x23F98A77b49Ce0a84b069d3119Af889077D6": {
        "label": "Laundering Aggregator Layer-4",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x55A64D432168Aa096Ec0773b0649722284": {
        "label": "Decoy Cold Storage",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x98E11F369910dCbAf51079367F47e65C0": {
        "label": "Pre-Exchange OTC Mule Layer-5",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x992334Fbb73816a7E01a91097241285A810": {
        "label": "Suspect 2 (Darknet Market Cashier)",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x5D4A91753c07e0c4013401579644D257721": {
        "label": "Express Mule (Fast Offramp)",
        "is_vasp": False,
        "vasp_name": None
    },
    "0xDEAD88102374628a5F389100155b400971": {
        "label": "Suspect 3 (Decoy DeFi Stagnant)",
        "is_vasp": False,
        "vasp_name": None
    },
    "0x66B88114c071295A8c64119842a781295": {
        "label": "Decoy DeFi Liquidity Pool",
        "is_vasp": False,
        "vasp_name": None
    },
    # Known VASP (Exchange) Wallets
    "0x28C5fe699d75F79b291c530fB69a19c1e89B": {
        "label": "Binance Hot Wallet 14",
        "is_vasp": True,
        "vasp_name": "Binance"
    },
    "0x84A3b1097b6e414c330fAc9392D0860A77F4": {
        "label": "CoinDCX Institutional Ingress",
        "is_vasp": True,
        "vasp_name": "CoinDCX"
    },
    "0x11B9d4077Ab834Ec9a738c8c2275A01233E0": {
        "label": "WazirX Liquidity Vault",
        "is_vasp": True,
        "vasp_name": "WazirX"
    },
    "0x77E1a29910cDa08745C227aBf891040899C1": {
        "label": "Kraken Prime Custody",
        "is_vasp": True,
        "vasp_name": "Kraken"
    }
}

TRANSACTIONS = [
    # Chain 1: Suspect 1 (5 hops to Binance) + Decoys
    {"from": "0x71C839a9bF32D15781a704e19B64aF38A1552F1", "to": "0x3A9F82dE77114Ac076a9D91834f890A9214441B", "amount": 12.50, "currency": "ETH", "timestamp": "2026-09-08 14:20:11 UTC"},
    {"from": "0x71C839a9bF32D15781a704e19B64aF38A1552F1", "to": "0x91F22C51a99A045bD61066B8e239eBc898842", "amount": 2.00, "currency": "ETH", "timestamp": "2026-09-08 14:25:34 UTC"},
    {"from": "0x91F22C51a99A045bD61066B8e239eBc898842", "to": "0x12E55Be38466cc0455Bf11904a25c6020031", "amount": 1.95, "currency": "ETH", "timestamp": "2026-09-08 15:10:02 UTC"},
    {"from": "0x3A9F82dE77114Ac076a9D91834f890A9214441B", "to": "0x44D7A144e05b9fB4F3218776ca1a94cD190C3", "amount": 12.42, "currency": "ETH", "timestamp": "2026-09-08 16:45:19 UTC"},
    {"from": "0x44D7A144e05b9fB4F3218776ca1a94cD190C3", "to": "0x88C31Dc611B291Af00b651Fe4c19412A511AE", "amount": 8.80, "currency": "ETH", "timestamp": "2026-09-08 19:10:44 UTC"},
    {"from": "0x44D7A144e05b9fB4F3218776ca1a94cD190C3", "to": "0x67B49EeB93466a9d7B41527Fc090334889", "amount": 3.50, "currency": "ETH", "timestamp": "2026-09-08 19:12:05 UTC"},
    {"from": "0x88C31Dc611B291Af00b651Fe4c19412A511AE", "to": "0x23F98A77b49Ce0a84b069d3119Af889077D6", "amount": 8.75, "currency": "ETH", "timestamp": "2026-09-09 02:15:30 UTC"},
    {"from": "0x88C31Dc611B291Af00b651Fe4c19412A511AE", "to": "0x55A64D432168Aa096Ec0773b0649722284", "amount": 0.05, "currency": "ETH", "timestamp": "2026-09-09 02:20:00 UTC"},
    {"from": "0x23F98A77b49Ce0a84b069d3119Af889077D6", "to": "0x98E11F369910dCbAf51079367F47e65C0", "amount": 8.71, "currency": "ETH", "timestamp": "2026-09-09 06:40:12 UTC"},
    {"from": "0x98E11F369910dCbAf51079367F47e65C0", "to": "0x28C5fe699d75F79b291c530fB69a19c1e89B", "amount": 8.68, "currency": "ETH", "timestamp": "2026-09-09 10:05:48 UTC"},

    # Chain 2: Suspect 2 (2 hops to CoinDCX)
    {"from": "0x992334Fbb73816a7E01a91097241285A810", "to": "0x5D4A91753c07e0c4013401579644D257721", "amount": 5.20, "currency": "ETH", "timestamp": "2026-09-09 11:15:00 UTC"},
    {"from": "0x5D4A91753c07e0c4013401579644D257721", "to": "0x84A3b1097b6e414c330fAc9392D0860A77F4", "amount": 5.15, "currency": "ETH", "timestamp": "2026-09-09 12:00:22 UTC"},

    # Chain 3: Suspect 3 (Decoy DeFi branch)
    {"from": "0xDEAD88102374628a5F389100155b400971", "to": "0x66B88114c071295A8c64119842a781295", "amount": 4.00, "currency": "ETH", "timestamp": "2026-09-09 13:45:00 UTC"},
    {"from": "0x55A64D432168Aa096Ec0773b0649722284", "to": "0x77E1a29910cDa08745C227aBf891040899C1", "amount": 0.05, "currency": "ETH", "timestamp": "2026-09-09 15:30:12 UTC"}
]

# ---------------------------------------------------------
# SECTION 3: BFS Algorithm
# ---------------------------------------------------------
def bfs_trace_to_vasp(start_address, transactions, wallets):
    """
    Executes Breadth-First Search starting from start_address.
    Stops immediately when any node is reached that is marked as a VASP.
    Returns: (path_edges, target_vasp_node)
    """
    adj = {}
    for tx in transactions:
        f = tx["from"]
        if f not in adj:
            adj[f] = []
        adj[f].append(tx)

    queue = deque([(start_address, [])])
    visited = {start_address}

    while queue:
        current, path = queue.popleft()
        node_info = wallets.get(current, {})

        if path and node_info.get("is_vasp"):
            return path, node_info, current

        for tx in adj.get(current, []):
            nxt = tx["to"]
            if nxt not in visited:
                visited.add(nxt)
                queue.append((nxt, path + [tx]))

    return None, None, None

# ---------------------------------------------------------
# UI CONTROLS
# ---------------------------------------------------------
suspect_options = [
    "0x71C839a9bF32D15781a704e19B64aF38A1552F1 (Primary Suspect - Multi-hop to Binance)",
    "0x992334Fbb73816a7E01a91097241285A810 (Suspect 2 - Fast 2-Hop to CoinDCX)",
    "0xDEAD88102374628a5F389100155b400971 (Suspect 3 - Decoy Unhosted DeFi Dead-End)"
]

col1, col2 = st.columns([3, 1])
with col1:
    selected_option = st.selectbox("Select Suspect Wallet for Forensic Tracing:", suspect_options)
    selected_address = selected_option.split(" ")[0].strip()

with col2:
    st.write("")
    st.write("")
    run_trace = st.button("🚀 Trace Funds", type="primary", use_container_width=True)

if run_trace or "last_trace" in st.session_state:
    if run_trace:
        st.session_state.last_trace = selected_address

    target_suspect = st.session_state.last_trace
    path, vasp_node, vasp_addr = bfs_trace_to_vasp(target_suspect, TRANSACTIONS, WALLETS)

    if path and vasp_node:
        st.success(f"🎯 Target VASP Identified: **{vasp_node['vasp_name']}** at address `{vasp_addr}` in {len(path)} hops!")

        # Visual Network Graph
        st.subheader("Network Transaction Graph Visualization")
        G = nx.DiGraph()

        # Add all sampled transactions into graph for context
        for tx in TRANSACTIONS:
            G.add_edge(tx["from"], tx["to"], weight=tx["amount"])

        # Identify path nodes & edges
        path_nodes = [target_suspect] + [tx["to"] for tx in path]
        path_edges = [(tx["from"], tx["to"]) for tx in path]

        pos = nx.spring_layout(G, seed=42, k=1.2)
        fig, ax = plt.subplots(figsize=(12, 6))

        # Color mapping
        node_colors = []
        node_sizes = []
        for n in G.nodes():
            if n == target_suspect:
                node_colors.append("#EF4444") # Red for Suspect
                node_sizes.append(900)
            elif n == vasp_addr:
                node_colors.append("#10B981") # Green for VASP
                node_sizes.append(1000)
            elif n in path_nodes:
                node_colors.append("#F59E0B") # Amber for intermediate hops
                node_sizes.append(700)
            else:
                node_colors.append("#94A3B8") # Gray for decoy nodes
                node_sizes.append(400)

        # Draw all edges in light grey
        nx.draw_networkx_nodes(G, pos, node_color=node_colors, node_size=node_sizes, ax=ax)
        nx.draw_networkx_edges(G, pos, edge_color="#CBD5E1", width=1.2, arrowsize=12, ax=ax)

        # Highlight traced path edges in crimson/blue
        nx.draw_networkx_edges(G, pos, edgelist=path_edges, edge_color="#2563EB", width=2.8, arrowsize=18, ax=ax)

        labels = {n: f"{n[:6]}..{n[-4:]}" + (f"\n[{WALLETS[n]['vasp_name']}]" if WALLETS.get(n, {}).get("is_vasp") else "") for n in G.nodes()}
        nx.draw_networkx_labels(G, pos, labels=labels, font_size=8, font_family="sans-serif", ax=ax)

        ax.set_title(f"Forensic Trail from {target_suspect[:8]}... to {vasp_node['vasp_name']}", fontsize=12)
        ax.axis("off")
        st.pyplot(fig)

        # Hop-by-Hop Table
        st.subheader("Hop-by-Hop Financial Flow Trail")
        table_rows = []
        for i, tx in enumerate(path, 1):
            to_wallet = WALLETS.get(tx["to"], {})
            dest_tag = f"🎯 {to_wallet['vasp_name']} (VASP)" if to_wallet.get("is_vasp") else to_wallet.get("label", "Private Mule")
            table_rows.append({
                "Hop": f"#{i}",
                "From Address": tx["from"],
                "To Address": tx["to"],
                "Destination Tag": dest_tag,
                "Amount": f"{tx['amount']} {tx['currency']}",
                "Timestamp": tx["timestamp"]
            })
        st.table(table_rows)

        # Downloadable PDF Report
        st.subheader("Law Enforcement Statutory Report (BNSS Sec 94)")

        def create_pdf_report(suspect, vasp_name, vasp_address, hops):
            # Fallback simple text-based PDF using bytes buffer
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            p.setFont("Helvetica-Bold", 16)
            p.drawString(50, 750, "CRYPTOTRACE FORENSIC INTELLIGENCE DOSSIER")
            p.setFont("Helvetica", 10)
            p.drawString(50, 735, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Reference: CT-BNSS-{datetime.utcnow().strftime('%Y%m%d')}")
            p.line(50, 725, 550, 725)

            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, 700, "1. EXECUTIVE SUMMARY & TARGET VASP")
            p.setFont("Helvetica", 10)
            p.drawString(50, 680, f"Suspect Wallet Address: {suspect}")
            p.drawString(50, 665, f"Identified Exchange (VASP): {vasp_name}")
            p.drawString(50, 650, f"VASP Deposit Wallet: {vasp_address}")
            p.drawString(50, 635, f"Total Traversed Path Depth: {len(hops)} Hop(s)")

            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, 605, "2. STATUTORY FREEZING REQUISITION (BNSS SECTION 94)")
            p.setFont("Helvetica", 9)
            text_lines = [
                "NOTICE UNDER SECTION 94 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023",
                "To Compliance Officer / Nodal Officer, " + vasp_name + ":",
                "Forensic tracing has established that proceeds originating from the suspect address",
                f"{suspect} were routed via {len(hops)} intermediate layering transactions into deposit accounts",
                f"at your exchange under wallet {vasp_address}.",
                "Pursuant to powers under Section 94 of BNSS, 2023, you are hereby directed to:",
                "1. Immediately freeze and immobilize all deposit wallets and user accounts linked to this deposit.",
                "2. Transmit all KYC dossiers, IP logs, linked bank accounts, and withdrawal requests within 24 hours.",
                "Non-compliance shall attract legal penalties under applicable statutory provisions."
            ]
            y = 585
            for line in text_lines:
                p.drawString(50, y, line)
                y -= 15

            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y - 10, "3. AUDITABLE HOP-BY-HOP TRANSACTION PATH")
            y -= 30
            p.setFont("Helvetica", 8)
            for i, h in enumerate(hops, 1):
                p.drawString(50, y, f"Hop {i}: {h['from'][:16]}... -> {h['to'][:16]}... | {h['amount']} {h['currency']} | {h['timestamp']}")
                y -= 14

            p.showPage()
            p.save()
            buffer.seek(0)
            return buffer.getvalue()

        try:
            pdf_bytes = create_pdf_report(target_suspect, vasp_node["vasp_name"], vasp_addr, path)
            st.download_button(
                label="📄 Download Official BNSS Section 94 Seizure Notice (PDF)",
                data=pdf_bytes,
                file_name=f"CryptoTrace_Freeze_Notice_{vasp_node['vasp_name']}.pdf",
                mime="application/pdf",
                type="primary"
            )
        except Exception as e:
            st.warning("Note: install reportlab for PDF generation in native python.")
            st.text_area("BNSS Section 94 Notice Boilerplate", f"""
REQUISITION UNDER SECTION 94 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023
To: Designated Compliance Officer, {vasp_node['vasp_name']}
Subject: Urgent Freezing of Crypto Asset Accounts and Furnishing of Documents.

Sir/Madam,
Forensic blockchain tracing originating from suspect address {target_suspect} confirms that illicit funds have landed into your exchange hotwallet/deposit address ({vasp_addr}) in {len(path)} hops.
Under Section 94 of BNSS, 2023, you are mandated to immediately freeze this account balance and preserve all KYC records.
""")

    else:
        st.error("⚠️ No VASP reached within transaction depth! The funds in this branch terminate in unhosted wallets or stagnant smart contracts.")
