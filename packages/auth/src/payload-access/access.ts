// import { 'admin', 'user' } from '@/collections/Users'
import { User } from '@/payload-types'
import { AccessArgs } from 'payload'
import type {  Where } from 'payload'

/**
 * Checks that the request is authenticated
 */

export const isAuthenticated = ({ req: { user } }: AccessArgs<User>) => {
    return Boolean(user)
}

/**
 * Checks that the user is a 'user' or 'admin' i.e. they are human
 */

export const isUser = ({ req: { user } }: AccessArgs<User>) => {
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

export const isDigitalColleague = ({ req: { user } }: AccessArgs<User>) => {
    if (!user) return false
    if (user.role === 'digital-colleague') {
        return true
    }
    return false
}

/**
 * Checks that the user is an 'admin'
 */

export const isAdmin = ({ req: { user } }: AccessArgs<User>): boolean => {
    // console.log('Checking isAdminUser for user:', user)
    if (user?.role === 'admin') {
        return true
    }
    return false
}


/**
 * Users can edit their own profile
 */
export const editOwnProfile = ({ req: { user }, id, data }: AccessArgs<User>): boolean => {

    // Allow admins to edit anything
    if (user?.role === 'admin') {
        return true
    }
    // Allow users to edit their own record
    return user?.id === (data as User)?.id
}

/**
 * can edit owned items
 */
export const isOwned = ({ req: { user } }: AccessArgs<User>): boolean | Where => {
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
export const isMember = ({ req: { user } }: AccessArgs<User>): boolean | Where => {
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
export const isMemberOrOwner = ({ req: { user } }: AccessArgs<User>): boolean | Where => {
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
