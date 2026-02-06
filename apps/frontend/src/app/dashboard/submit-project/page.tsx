"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Shield, Home, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProtectedRoute } from "@/components/protected-route";
import { uploadToIPFS, uploadImageToIPFS } from "@/lib/storage/ipfs";
import { ProjectMetadata } from "@/types";
import { PROJECT_ABI, PROJECT_ADDRESS } from "@/contracts";

export default function SubmitProjectPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [requestedFunding, setRequestedFunding] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    // Simplified: Single milestone
    const [milestoneTitle, setMilestoneTitle] = useState("");
    const [milestoneDescription, setMilestoneDescription] = useState("");
    const [milestoneDeadline, setMilestoneDeadline] = useState("");

    // Simplified: Single team member
    const [teamName, setTeamName] = useState("");
    const [teamRole, setTeamRole] = useState("");

    const [isUploading, setIsUploading] = useState(false);

    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            // Upload image if provided
            let imageUrl = "";
            if (imageFile) {
                imageUrl = await uploadImageToIPFS(imageFile);
            }

            // Create simplified metadata object
            const metadata: ProjectMetadata = {
                title,
                description,
                milestones: milestoneTitle
                    ? [
                        {
                            title: milestoneTitle,
                            description: milestoneDescription,
                            fundingAmount: requestedFunding,
                            deadline: milestoneDeadline,
                            deliverables: [milestoneDescription],
                        },
                    ]
                    : [],
                teamInfo: teamName
                    ? [
                        {
                            name: teamName,
                            role: teamRole,
                        },
                    ]
                    : [],
                requestedFunding,
                category,
                imageUrl,
            };

            // Upload metadata to IPFS
            const cid = await uploadToIPFS(metadata);

            // Submit to smart contract
            writeContract({
                address: PROJECT_ADDRESS,
                abi: PROJECT_ABI,
                functionName: "submitProject",
                args: [cid, parseEther(requestedFunding)],
            });
        } catch (err) {
            console.error("Submission error:", err);
            alert("Failed to submit project. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isSuccess) {
        setTimeout(() => router.push("/dashboard/projects"), 2000);
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen max-w-7xl mx-auto bg-background">
                <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
                    <div className="container flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6" />
                            <span className="text-xl font-bold">ZeroTrace</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <ConnectButton />
                            <ModeToggle />
                        </div>
                    </div>
                </nav>

                <main className="container py-8 max-w-4xl">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="gap-2 mb-6">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="text-3xl">Submit Project Proposal</CardTitle>
                            <CardDescription>
                                Request funding for your public goods project through quadratic funding
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Basic Information</h3>

                                    <div className="space-y-2">
                                        <label htmlFor="title" className="block text-sm font-medium">
                                            Project Title *
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                            placeholder="My Awesome Public Goods Project"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="description" className="block text-sm font-medium">
                                            Description *
                                        </label>
                                        <textarea
                                            id="description"
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-background min-h-[150px]"
                                            placeholder="Describe what your project does and why it matters..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="category" className="block text-sm font-medium">
                                                Category *
                                            </label>
                                            <select
                                                id="category"
                                                required
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-background"
                                            >
                                                <option value="">Select category</option>
                                                <option value="infrastructure">Infrastructure</option>
                                                <option value="tools">Developer Tools</option>
                                                <option value="education">Education</option>
                                                <option value="community">Community</option>
                                                <option value="research">Research</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="funding" className="block text-sm font-medium">
                                                Requested Funding (ETH) *
                                            </label>
                                            <input
                                                id="funding"
                                                type="number"
                                                step="0.01"
                                                required
                                                value={requestedFunding}
                                                onChange={(e) => setRequestedFunding(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-background"
                                                placeholder="10.0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="image" className="block text-sm font-medium">
                                            Project Image (optional)
                                        </label>
                                        <input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        />
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="mt-4 rounded-lg max-h-48 object-cover"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Optional Milestone */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">First Milestone (optional)</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Add your first milestone. You can add more after submission.
                                    </p>

                                    <div className="space-y-2">
                                        <label htmlFor="milestone-title" className="block text-sm font-medium">
                                            Milestone Title
                                        </label>
                                        <input
                                            id="milestone-title"
                                            type="text"
                                            value={milestoneTitle}
                                            onChange={(e) => setMilestoneTitle(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                            placeholder="e.g., Launch Beta Version"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="milestone-description" className="block text-sm font-medium">
                                            Description
                                        </label>
                                        <textarea
                                            id="milestone-description"
                                            value={milestoneDescription}
                                            onChange={(e) => setMilestoneDescription(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                            placeholder="What will be delivered in this milestone?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="milestone-deadline" className="block text-sm font-medium">
                                            Deadline
                                        </label>
                                        <input
                                            id="milestone-deadline"
                                            type="date"
                                            value={milestoneDeadline}
                                            onChange={(e) => setMilestoneDeadline(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        />
                                    </div>
                                </div>

                                {/* Optional Team Lead */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Team Lead (optional)</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Add the team lead. More members can be added later.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="team-name" className="block text-sm font-medium">
                                                Name
                                            </label>
                                            <input
                                                id="team-name"
                                                type="text"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-background"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="team-role" className="block text-sm font-medium">
                                                Role
                                            </label>
                                            <input
                                                id="team-role"
                                                type="text"
                                                value={teamRole}
                                                onChange={(e) => setTeamRole(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md bg-background"
                                                placeholder="Project Lead"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Link href="/dashboard">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={isUploading || isPending || isConfirming}
                                        className="gap-2"
                                    >
                                        {(isUploading || isPending || isConfirming) && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        {isUploading
                                            ? "Uploading..."
                                            : isPending
                                                ? "Confirming..."
                                                : isConfirming
                                                    ? "Submitting..."
                                                    : "Submit Project"}
                                    </Button>
                                </div>

                                {isSuccess && (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                                        ✓ Project submitted successfully! Redirecting...
                                    </div>
                                )}

                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                                        Error: {error.message}
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </ProtectedRoute>
    );
}
