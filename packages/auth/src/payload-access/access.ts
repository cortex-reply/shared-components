import { AccessArgs } from 'payload'
import type {  Where } from 'payload'
import type { User } from '@/types'

/**
 * Checks that the request is authenticated
 */
const isAuthenticated = ({ req: { user } }: AccessArgs<Partial<Partial<User>>>) => {
    return Boolean(user)
}

/**
 * Checks that the user is a 'user' or 'admin' i.e. they are human
 */
const isUser = ({ req: { user } }: AccessArgs<Partial<User>>) => {
    if (!user) return false
    if (user.role === 'user') {
        return true
    }
    if (user.role === 'admin') {
        return true
    }
    return false
}

/**
 * Checks that the user is a 'digital-colleague'
 */
const isDigitalColleague = ({ req: { user } }: AccessArgs<Partial<User>>) => {
    if (!user) return false
    if (user.role === 'digital-colleague') {
        return true
    }
    return false
}

/**
 * Checks that the user is an 'admin'
 */
const isAdmin = ({ req: { user } }: AccessArgs<Partial<User>>): boolean => {
    // console.log('Checking isAdminUser for user:', user)
    if (user?.role === 'admin') {
        return true
    }
    return false
}

/**
 * Users can edit their own profile
 */
const editOwnProfile = ({ req: { user }, data }: AccessArgs<Partial<User>>): boolean => {

    // Allow admins to edit anything
    if (user?.role === 'admin') {
        return true
    }
    // Allow users to edit their own record
    return user?.id === (data as User)?.id
}

/**
 * Users can edit their own profile ONLY
 */
const ownOnly = ({ req: { user }, data }: AccessArgs<Partial<User>>): boolean => {
    // Allow users to edit their own record
    return user?.id === (data as User)?.id
}

/**
 * can edit owned items
 */
const isOwned = ({ req: { user } }: AccessArgs<Partial<User>>): boolean | Where => {
    if (!user) return false

    // Allow admins to edit anything
    if (user?.role === 'admin') {
        return true
    }
    // Allow users to edit their own record
    const query: Where = {
        owner: {
            equals: user.id,
        },
    }
    return query
}

/**
 * User is in the member relationship of the item
 */
const isMember = ({ req: { user } }: AccessArgs<Partial<User>>): boolean | Where => {
    if (!user) return false

    // Allow admins to edit anything
    if (user?.role === 'admin') {
        return true
    }
    // Allow users to edit their own record
    const query: Where = {

        'members.user': {
            equals: user.id,
        },

    }
    return query
}

/**
 * User is in the member relationship of the item
 */
const isMemberOrOwner = ({ req: { user } }: AccessArgs<Partial<User>>): boolean | Where => {
    if (!user) return false

    // Allow admins to edit anything
    if (user?.role === 'admin') {
        return true
    }
    // Allow users to edit their own record
    const query: Where = {
        or: [
            {
                'members.user': {
                    equals: user.id,
                },
            },
            {
                owner: {
                    equals: user.id,
                },
            },
        ],
    }
    return query
}

export const payloadAcl = {
    isAuthenticated,
    isUser,
    isDigitalColleague,
    isAdmin,
    editOwnProfile,
    isOwned,
    isMember,
    isMemberOrOwner,
    ownOnly,
}
