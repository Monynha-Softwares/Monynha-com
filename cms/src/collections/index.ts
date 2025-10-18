import type { CollectionConfig } from 'payload';

import Authors from './Authors';
import Categories from './Categories';
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

export {
  Authors,
  Categories,
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

export const collections: CollectionConfig[] = [
  Posts,
  Solutions,
  Repositories,
  TeamMembers,
  HomepageFeatures,
  SiteSettings,
  NewsletterSubscribers,
  Leads,
  Authors,
  Categories,
  Users,
  Media,
];

export default collections;
