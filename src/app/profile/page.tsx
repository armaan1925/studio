import { PageShell } from "@/components/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { placeholderImages, currentUser as user } from "@/lib/data";
import { Award, Book, Edit, Star } from "lucide-react";
import { MedicalQRCode } from "@/components/profile/MedicalQRCode";

export default function ProfilePage() {
    const avatarImage = placeholderImages.find((img) => img.id === 'user-avatar-1');

    return (
        <PageShell title="My Profile">
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                {avatarImage && (
                                    <AvatarImage 
                                        src={avatarImage.imageUrl} 
                                        alt={user.name} 
                                        data-ai-hint={avatarImage.imageHint}
                                    />
                                )}
                                <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground mt-1">{user.institution}</p>
                            <Badge variant="secondary" className="mt-2">{user.role}</Badge>
                            <Button variant="outline" size="sm" className="mt-4 w-full">
                                <Edit className="mr-2 size-4"/> Edit Profile
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics & Achievements</CardTitle>
                            <CardDescription>Your progress and accomplishments on MediMind AI.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-md border p-4">
                                <div>
                                    <p className="font-medium">Total Points</p>
                                    <p className="text-sm text-muted-foreground">Earned from quizzes and challenges</p>
                                </div>
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <Star className="size-6" />
                                    {user.points}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-md font-medium mb-2">My Achievements</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.achievements.map((achievement, i) => (
                                        <Badge key={i} variant="outline" className="flex items-center gap-1">
                                            <Award className="size-3" /> {achievement}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator />
                            
                            <div>
                                <h3 className="text-md font-medium mb-2">My Certificates</h3>
                                <div className="flex flex-col items-center text-center p-6 bg-muted rounded-md">
                                    <Book className="size-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">No certificates earned yet.</p>
                                    <p className="text-xs text-muted-foreground">Complete learning modules to earn certificates.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <MedicalQRCode user={user} />
                </div>
            </div>
        </PageShell>
    );
}
