export type HonoAppType = {
    Bindings: {
      HEIMDALL_BUCKET: R2Bucket
    }, 
    Env: {}
}


export type User = {
    id: string;
    name: string;
    email: string;
}

export type Project = { 
    id: string;
    name: string;
    description: string;
    admins: User[];
    members: User[];
}