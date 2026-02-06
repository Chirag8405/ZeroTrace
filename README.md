# ZeroTrace

**Privacy-preserving quadratic funding platform for decentralized communities**

ZeroTrace is a decentralized platform that enables communities to fairly allocate treasury funds to public good projects through quadratic voting and funding, while maintaining complete voter anonymity and preventing sybil attacks through Anon Aadhaar integration.

## Overview

Traditional funding mechanisms often suffer from plutocratic influence, where large token holders can dominate decision-making. ZeroTrace addresses this through quadratic funding—a mathematically optimal allocation mechanism that gives small contributors meaningful influence while preventing whale domination.

The platform combines three critical technologies:

- **Quadratic Funding**: Democratic resource allocation where 1,000 small votes outweigh one large vote
- **Zero-Knowledge Proofs**: Complete voter anonymity through cryptographic verification
- **Sybil Resistance**: One-person-one-vote enforcement via Anon Aadhaar without revealing identity

## Key Features

### For Voters

- **Anonymous Voting**: Cast votes without revealing your identity or voting preferences
- **Fair Influence**: Quadratic mechanism ensures every voice matters, regardless of holdings
- **One Person, One Vote**: Anon Aadhaar verification prevents multi-accounting
- **Voice Credits**: Each voter receives 100 voice credits to allocate across projects
- **No Personal Data**: Zero personal information stored on-chain

### For Project Builders

- **Permissionless Submission**: Anyone can propose a project for funding
- **Anti-Spam Protection**: Required stake prevents spam submissions
- **Transparent Status**: Real-time tracking of approval, funding, and completion
- **IPFS Metadata**: Rich project details stored off-chain with on-chain references
- **Funding Transparency**: Public visibility into received funding and vote counts

### For Platform Administrators

- **Project Moderation**: Approve or reject submitted projects
- **Configurable Parameters**: Adjust minimum stake requirements and treasury address
- **Status Management**: Mark projects as funded or completed
- **Event Transparency**: All actions logged through smart contract events

## Architecture

ZeroTrace is built as a modern monorepo with clear separation between blockchain infrastructure and frontend application.

### Technology Stack

**Blockchain Layer**
- Solidity ^0.8.28
- Hardhat 2.22+ development environment
- OpenZeppelin Contracts for security patterns
- Ethers.js 6.16+ for contract interaction
- Chai for comprehensive unit testing

**Frontend Application**
- Next.js 16 with App Router
- React 19 for UI components
- Wagmi & RainbowKit for Web3 connectivity
- Anon Aadhaar for privacy-preserving identity verification
- Tailwind CSS 4 for styling
- shadcn/ui component library
- Pinata for IPFS metadata storage

**Development Tools**
- Turborepo for monorepo orchestration
- TypeScript for type safety
- pnpm for efficient dependency management
- Prettier for code formatting

### Project Structure

```
zerotrace/
├── apps/
│   ├── blockchain/          # Smart contracts and deployment
│   │   ├── contracts/       # Solidity contracts
│   │   ├── scripts/         # Deployment scripts
│   │   ├── test/            # Contract tests
│   │   └── hardhat.config.ts
│   └── frontend/            # Next.js application
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── contracts/   # Contract ABIs and addresses
│       │   ├── lib/         # Utilities and configs
│       │   └── types/       # TypeScript definitions
│       └── package.json
├── packages/
│   └── config/              # Shared configuration
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # PNPM workspace config
└── package.json             # Root workspace config
```

## Smart Contracts

### VoterRegistry

Manages voter registration and sybil resistance through Anon Aadhaar nullifiers.

**Key Functions**
- `registerVoter(uint256 nullifier)`: Register a verified voter with unique nullifier
- `isNullifierUsed(uint256)`: Check if a nullifier has been registered
- `getTotalRegisteredVoters()`: Query total registered voter count
- `getInitialVoiceCredits()`: Returns default voice credits (100)

**Security Features**
- Nullifier uniqueness enforcement
- Zero-knowledge proof verification
- No personal data storage
- Immutable registration records

### Project

Handles project lifecycle from submission through completion.

**Key Functions**
- `submitProject(string metadataURI, uint256 requestedFunding)`: Submit new project proposal
- `approveProject(uint256 projectId)`: Admin approval for pending projects
- `updateProjectStatus(uint256 projectId, ProjectStatus status)`: Owner status updates
- `addFunding(uint256 projectId, uint256 amount)`: Record funding allocation
- `incrementVotes(uint256 projectId, uint256 votes)`: Track vote counts
- `getActiveProjects()`: Query all approved projects
- `getProject(uint256 projectId)`: Retrieve project details

**Project Lifecycle**
1. **Pending**: Submitted and awaiting admin approval
2. **Active**: Approved and open for voting
3. **Funded**: Received allocated funding from quadratic distribution
4. **Completed**: Milestones delivered successfully
5. **Cancelled**: Rejected or cancelled by owner/admin

### ProjectRegistry (Phase 2)

Extended project management with anti-spam stake mechanism.

**Key Functions**
- `submitProject(string ipfsHash, uint256 requestedAmount)`: Submit with required stake
- `activateProject(uint64 projectId)`: Admin approval
- `rejectProject(uint64 projectId)`: Admin rejection with stake forfeit to treasury
- `withdrawStake(uint64 projectId)`: Reclaim stake after approval
- `setMinStake(uint256)`: Configure minimum stake requirement
- `getProjectsByOwner(address)`: Query projects by creator

**Anti-Spam Mechanisms**
- **Minimum Stake**: Required deposit to submit (configurable by admin)
- **Cooldown Period**: 24-hour wait between submissions per address
- **Submission Cap**: Maximum 3 active projects per address
- **Stake Forfeiture**: Rejected projects lose stake to treasury
- **Stake Recovery**: Approved projects can withdraw stake after activation

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MetaMask or compatible Web3 wallet
- Anon Aadhaar verification (for voting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/zerotrace.git
   cd zerotrace
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   **Blockchain** (`apps/blockchain/.env`):
   ```bash
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   PRIVATE_KEY=your_deployer_private_key
   ```

   **Frontend** (`apps/frontend/.env.local`):
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS=0x_deployed_contract_address
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
   NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
   ```

### Development

**Start all services in development mode**
```bash
pnpm dev
```

This runs:
- Frontend: http://localhost:3000
- Blockchain: Hardhat local node

**Run specific workspace**
```bash
# Frontend only
pnpm --filter @zerotrace/frontend dev

# Build blockchain contracts
pnpm --filter @zerotrace/blockchain build
```

### Smart Contract Development

**Compile contracts**
```bash
cd apps/blockchain
pnpm build
```

**Run tests**
```bash
pnpm test
```

**Deploy to local network**
```bash
pnpm hardhat node                    # Terminal 1: Start local node
pnpm run deploy                      # Terminal 2: Deploy contracts
```

**Deploy to Sepolia testnet**
```bash
pnpm run deploy:sepolia
```

The deployment script automatically:
- Deploys contracts to the specified network
- Extracts and saves ABIs
- Updates frontend contract configurations
- Waits for block confirmations on public networks

### Frontend Development

**Start development server**
```bash
cd apps/frontend
pnpm dev
```

**Build for production**
```bash
pnpm build
pnpm start
```

**Type checking**
```bash
pnpm type-check
```

## Usage

### For Voters

1. **Register**
   - Navigate to `/register`
   - Connect your Web3 wallet
   - Complete Anon Aadhaar verification
   - Receive 100 voice credits on-chain

2. **Vote on Projects**
   - Browse active projects at `/projects`
   - Review project details, milestones, and funding requests
   - Allocate voice credits using quadratic voting
   - Vote cost = (votes)² in voice credits
   - Submit anonymous votes through zero-knowledge proofs

3. **Track Impact**
   - View real-time vote counts and funding allocations
   - See which projects receive funding
   - Monitor project completion status

### For Project Builders

1. **Submit Project**
   - Navigate to `/submit-project`
   - Fill in project details (title, description, milestones, team, funding request)
   - Prepare required stake amount
   - Upload metadata to IPFS
   - Submit on-chain transaction with stake

2. **Project Review**
   - Wait for admin approval (Status: Pending)
   - Approved projects move to Active status
   - Rejected projects forfeit stake to treasury

3. **Post-Approval**
   - Withdraw your stake after approval
   - Monitor votes and funding allocation
   - Manage project through completion

4. **My Projects**
   - View all submitted projects at `/my-projects`
   - Track status, votes, and funding
   - Withdraw stake for approved projects
   - Update project status

### For Administrators

**Project Moderation**
- Review pending submissions
- Approve quality projects
- Reject spam or inappropriate content

**Platform Configuration**
- Adjust minimum stake requirements
- Update treasury address
- Mark projects as funded or completed

## Testing

### Smart Contract Tests

```bash
cd apps/blockchain
pnpm test
```

The test suite covers:
- Voter registration and nullifier uniqueness
- Project submission and lifecycle
- Authorization and access control
- Funding allocation and vote tracking
- Edge cases and error conditions
- Anti-spam mechanisms (stake, cooldown, caps)

### Frontend Testing

```bash
cd apps/frontend
pnpm test                # Unit tests
pnpm type-check          # TypeScript validation
pnpm lint                # Code quality
```

## Security Considerations

### Smart Contract Security

- **Access Control**: Role-based permissions for admin functions
- **Reentrancy Protection**: No external calls in state-changing functions
- **Integer Overflow**: Solidity 0.8+ built-in overflow checks
- **Input Validation**: Comprehensive parameter validation
- **Event Logging**: All critical actions emit events for transparency

### Privacy Guarantees

- **Vote Anonymity**: Semaphore protocol ensures unlinkability
- **Identity Privacy**: Anon Aadhaar reveals no personal information
- **Off-Chain Metadata**: Personal details stored on IPFS, not blockchain
- **Nullifier Security**: One-way cryptographic commitment

### Recommended Practices

- Never share private keys or seed phrases
- Verify contract addresses before transactions
- Review transaction details in wallet before signing
- Keep Anon Aadhaar credentials secure
- Use hardware wallets for mainnet deployments

## Deployment

### Production Deployment Checklist

**Smart Contracts**
- [ ] Audit contracts with professional security firm
- [ ] Complete comprehensive test coverage (>95%)
- [ ] Deploy to testnet and verify functionality
- [ ] Configure production parameters (stake amounts, addresses)
- [ ] Deploy to mainnet with multi-sig admin
- [ ] Verify contracts on block explorer
- [ ] Transfer admin rights to DAO or multi-sig

**Frontend**
- [ ] Set production environment variables
- [ ] Build and optimize assets (`pnpm build`)
- [ ] Deploy to Vercel, Netlify, or similar
- [ ] Configure custom domain and SSL
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (privacy-preserving)
- [ ] Test with production contract addresses

**Infrastructure**
- [ ] Set up Pinata IPFS pinning service
- [ ] Configure RPC endpoints (Infura, Alchemy)
- [ ] Set up monitoring and alerts
- [ ] Document deployment addresses
- [ ] Create incident response plan

## Contributing

We welcome contributions from the community. Before submitting pull requests, please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes with clear commit messages
4. Add tests for new functionality
5. Run the full test suite (`pnpm test`)
6. Run linting and formatting (`pnpm format`)
7. Push to your fork and submit a pull request

### Development Guidelines

- Follow existing code style and conventions
- Write comprehensive tests for smart contracts
- Document complex logic with comments
- Use TypeScript strict mode
- Maintain backwards compatibility where possible
- Update documentation for API changes

## Roadmap

### Phase 1: Core Infrastructure (Completed)
- [x] Smart contract architecture (VoterRegistry, Project)
- [x] Basic frontend with wallet connection
- [x] Anon Aadhaar integration
- [x] Landing page and navigation
- [x] Project browsing interface

### Phase 2: Enhanced Project Management (Completed)
- [x] ProjectRegistry contract with anti-spam mechanisms
- [x] Stake-based submission system
- [x] Cooldown period and submission caps
- [x] Project submission interface with IPFS
- [x] Project detail pages
- [x] My Projects dashboard

### Phase 3: Voting System (In Progress)
- [ ] Semaphore integration for anonymous voting
- [ ] Voice credit management
- [ ] Quadratic voting UI
- [ ] Vote aggregation and tallying
- [ ] Real-time vote tracking

### Phase 4: Funding Distribution (Planned)
- [ ] Quadratic funding calculation engine
- [ ] Automated fund allocation
- [ ] Matching pool management
- [ ] Payout mechanisms
- [ ] Revenue sharing for completed projects

### Phase 5: Advanced Features (Future)
- [ ] Multi-round funding campaigns
- [ ] Project milestone tracking
- [ ] Reputation system for builders
- [ ] DAO governance for platform parameters
- [ ] Multi-chain deployment
- [ ] Mobile application

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Anon Aadhaar**: Privacy-preserving identity verification
- **Semaphore**: Zero-knowledge group membership protocol
- **Gitcoin**: Pioneering quadratic funding research
- **Vitalik Buterin**: Quadratic funding mechanism design
- **OpenZeppelin**: Secure smart contract libraries

## Support

For questions, issues, or contributions:

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/zerotrace/issues)
- **Documentation**: [Read the full docs](https://docs.zerotrace.example)
- **Discord**: [Join our community](https://discord.gg/zerotrace)
- **Twitter**: [@ZeroTrace](https://twitter.com/zerotrace)

---

Built with privacy, fairness, and transparency at its core.
