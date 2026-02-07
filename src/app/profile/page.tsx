'use client';

import { useState, useEffect } from 'react';
import { PageShell } from "@/components/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { placeholderImages } from "@/lib/data";
import { Award, Book, Edit, Save, Star, X } from "lucide-react";
import { MedicalQRCode } from "@/components/profile/MedicalQRCode";
import { getUserProfile, saveUserProfile, type UserProfile } from '@/lib/user';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { currentUser as mockUser } from '@/lib/data';
import MedicalReports from '@/components/profile/MedicalReports';

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile>(mockUser);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setUser(getUserProfile());
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'achievements' || name === 'allergies' || name === 'medicalConditions') {
            setUser(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
        } else if (name === 'age' || name === 'points') {
            setUser(prev => ({...prev, [name]: Number(value) || 0 }));
        } else {
            setUser(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        saveUserProfile(user);
        setIsEditing(false);
        toast({
            title: "Profile Saved",
            description: "Your profile has been successfully updated.",
        });
    };
    
    const handleCancel = () => {
        setUser(getUserProfile()); // Revert changes
        setIsEditing(false);
    }

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
                            {isEditing ? (
                                <div className='w-full px-4 space-y-4'>
                                     <div className="text-left"><Label htmlFor="name">Full Name</Label><Input id="name" name="name" value={user.name} onChange={handleInputChange} /></div>
                                     <div className="text-left"><Label htmlFor="email">Email</Label><Input id="email" name="email" value={user.email} onChange={handleInputChange} /></div>
                                     <div className="text-left"><Label htmlFor="institution">Institution</Label><Input id="institution" name="institution" value={user.institution} onChange={handleInputChange} /></div>
                                     <div className="text-left"><Label htmlFor="role">Role</Label><Input id="role" name="role" value={user.role} onChange={handleInputChange} /></div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold">{user.name}</h2>
                                    <p className="text-muted-foreground">{user.email}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{user.institution}</p>
                                    <Badge variant="secondary" className="mt-2">{user.role}</Badge>
                                </>
                            )}
                            
                             {isEditing ? (
                                <div className="mt-4 w-full flex gap-2">
                                     <Button variant="outline" size="sm" className="w-full" onClick={handleCancel}>
                                        <X className="mr-2 size-4"/> Cancel
                                    </Button>
                                    <Button size="sm" className="w-full" onClick={handleSave}>
                                        <Save className="mr-2 size-4"/> Save
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 size-4"/> Edit Profile
                                </Button>
                            )}
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
                            {isEditing ? (
                                <div className='space-y-4'>
                                    <div>
                                        <Label htmlFor='points'>Total Points</Label>
                                        <Input id="points" name="points" type="number" value={user.points} onChange={handleInputChange} />
                                    </div>
                                     <div>
                                        <Label htmlFor='achievements'>Achievements (comma-separated)</Label>
                                        <Input id="achievements" name="achievements" value={user.achievements.join(', ')} onChange={handleInputChange} />
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                        {user.achievements.length > 0 && user.achievements[0] !== '' ? user.achievements.map((achievement, i) => (
                                            <Badge key={i} variant="outline" className="flex items-center gap-1">
                                                <Award className="size-3" /> {achievement}
                                            </Badge>
                                        )) : <p className='text-sm text-muted-foreground'>No achievements yet.</p>}
                                    </div>
                                </div>
                                </>
                            )}
                            
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
                     <Card>
                        <CardHeader>
                            <CardTitle>Emergency Medical Information</CardTitle>
                             <CardDescription>
                                This critical information will be encoded in your Medical ID QR Code for emergency use.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='age'>Age</Label>
                                        <Input id="age" name="age" type="number" value={user.age} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor='bloodGroup'>Blood Group</Label>
                                        <Input id="bloodGroup" name="bloodGroup" value={user.bloodGroup} onChange={handleInputChange} />
                                    </div>
                                    <div className='md:col-span-2'>
                                        <Label htmlFor='allergies'>Allergies (comma-separated)</Label>
                                        <Input id="allergies" name="allergies" value={user.allergies.join(', ')} onChange={handleInputChange} placeholder="e.g. Penicillin, Peanuts"/>
                                    </div>
                                    <div className='md:col-span-2'>
                                        <Label htmlFor='medicalConditions'>Existing Medical Conditions (comma-separated)</Label>
                                        <Input id="medicalConditions" name="medicalConditions" value={user.medicalConditions.join(', ')} onChange={handleInputChange} placeholder="e.g. Asthma, Diabetes" />
                                    </div>
                                    <div className='md:col-span-2'>
                                        <Label htmlFor='phone'>Emergency Contact Phone</Label>
                                        <Input id="phone" name="phone" value={user.phone} onChange={handleInputChange} placeholder="e.g. +1-234-567-890" />
                                    </div>
                                </div>
                            ) : (
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm'>
                                    <div className='space-y-1'>
                                        <p className='text-muted-foreground'>Age</p>
                                        <p className='font-medium text-base'>{user.age}</p>
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='text-muted-foreground'>Blood Group</p>
                                        <p className='font-medium text-base'>{user.bloodGroup}</p>
                                    </div>
                                    <div className='col-span-2 space-y-1'>
                                        <p className='text-muted-foreground'>Emergency Contact</p>
                                        <p className='font-medium text-base'>{user.phone}</p>
                                    </div>
                                     <div className='col-span-full space-y-1'>
                                        <p className='text-muted-foreground'>Allergies</p>
                                        <p className='font-medium'>{user.allergies.join(', ') || 'None reported'}</p>
                                    </div>
                                    <div className='col-span-full space-y-1'>
                                        <p className='text-muted-foreground'>Existing Medical Conditions</p>
                                        <p className='font-medium'>{user.medicalConditions.join(', ') || 'None reported'}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-3">
                    <MedicalReports />
                </div>
                <div className="lg:col-span-3">
                    <MedicalQRCode user={user} />
                </div>
            </div>
        </PageShell>
    );
}
