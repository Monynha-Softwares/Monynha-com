import type { CollectionConfig } from 'payload';
import HomepageFeatures from './HomepageFeatures';
import Leads from './Leads';
import Media from './Media';
import NewsletterSubscribers from './NewsletterSubscribers';
import Posts from './Posts';
import Repositories from './Repositories';
import SiteSettings from './SiteSettings';
import Solutions from './Solutions';
import TeamMembers from './TeamMembers';
import Users from './Users';

const collections: CollectionConfig[] = [
  Users,
  Media,
  Posts,
  Solutions,
  Repositories,
  TeamMembers,
  HomepageFeatures,
  SiteSettings,
  NewsletterSubscribers,
  Leads,
];

export default collections;

export {
  HomepageFeatures,
  Leads,
  Media,
  NewsletterSubscribers,
  Posts,
  Repositories,
  SiteSettings,
  Solutions,
  TeamMembers,
  Users,
};

export type * from '../../payload-types';
