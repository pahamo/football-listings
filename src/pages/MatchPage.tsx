import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFixtureById } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { parseMatchSlug, generateMatchMeta, updateDocumentMeta } from '../utils/seo';
import { formatDetailedDate } from '../utils/dateFormat';
import AffiliateDisclosure, { withAffiliateAriaLabel } from '../components/legal/AffiliateDisclosure';

const MatchPage: React.FC = () => {
  const { matchSlug, matchId, id } = useParams<{ matchSlug?: string; matchId?: string; id?: string }>();
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFixture = async () => {
      let parsedId: number;
      
      // Handle new SEO-friendly URLs with slugs
      if (matchSlug) {
        parsedId = parseMatchSlug(matchSlug) || 0;
      } else {
        // Handle legacy URLs
        const raw = matchId ?? id;
        if (!raw) {
          setError('No match ID provided');
          setLoading(false);
          return;
        }
        parsedId = parseInt(raw, 10);
      }

      if (!parsedId || isNaN(parsedId)) {
        setError('Invalid match ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Add debug logging
        console.log('MatchPage: Loading fixture with ID:', parsedId);
        const startTime = performance.now();
        
        const fixtureData = await getFixtureById(parsedId);
        
        const endTime = performance.now();
        console.log(`MatchPage: Fixture loaded in ${endTime - startTime}ms`);
        
        if (!fixtureData) {
          setError('Match not found');
        } else {
          setFixture(fixtureData);
          
          // Update SEO meta tags
          const meta = generateMatchMeta(fixtureData);
          updateDocumentMeta(meta);
        }
      } catch (err) {
        console.error('Failed to load fixture:', err);
        setError('Failed to load match details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadFixture();
  }, [matchSlug, matchId, id]);

  const formatDateTime = (utcKickoff: string) => {
    return formatDetailedDate(utcKickoff);
  };

  const getBroadcasterLink = (providerName: string, href?: string) => {
    if (href) return href;
    
    // Fallback URLs as specified
    switch (providerName) {
      case 'Sky Sports':
        return 'https://www.skysports.com/football/fixtures-results';
      case 'TNT Sports':
        return 'https://tntsports.co.uk/football';
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <div className="match-page">
        <Header 
          title="Match Details"
          subtitle="Loading match information..."
        />
        
        <main>
          <div className="wrap">
            <div className="loading">Loading match details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-page">
        <Header 
          title="Match Details"
          subtitle="Error loading match information"
        />
        
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="match-page">
        <Header 
          title="Match Details"
          subtitle="Match not found"
        />
        
        <main>
          <div className="wrap">
            <div className="no-fixtures">
              <p>Match not found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="match-page">
      <StructuredData type="match" data={fixture} />
      <Header
        title="Match Locator"
        subtitle="Football TV Schedule (UK)"
      />

      <main>
        <div className="wrap">
          <h1 style={{ marginTop: 32, marginBottom: 16, fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>
            {fixture.home.name} vs {fixture.away.name}
          </h1>
          {/* Match Header */}
          <div className="fixture-card" style={{ marginBottom: '24px', padding: '24px' }}>
            <div className="fixture-datetime" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              {formatDateTime(fixture.kickoff_utc)}
            </div>
            
            <div className="fixture-teams" style={{ marginBottom: '16px' }}>
              <div className="team home-team">
                {fixture.home.crest && (
                  <img 
                    src={fixture.home.crest} 
                    alt={`${fixture.home.name} crest`}
                    className="team-crest"
                    style={{ width: '32px', height: '32px' }}
                  />
                )}
                <span className="team-name" style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                  {fixture.home.name}
                </span>
              </div>
              
              <div className="vs" style={{ fontSize: '1.1rem', fontWeight: '600' }}>vs</div>
              
              <div className="team away-team">
                {fixture.away.crest && (
                  <img 
                    src={fixture.away.crest} 
                    alt={`${fixture.away.name} crest`}
                    className="team-crest"
                    style={{ width: '32px', height: '32px' }}
                  />
                )}
                <span className="team-name" style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                  {fixture.away.name}
                </span>
              </div>
            </div>

            {/* Venue */}
            {fixture.venue && (
              <div className="fixture-venue" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                📍 {fixture.venue}
              </div>
            )}

            {/* Matchweek */}
            {fixture.matchweek && (
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                Matchweek {fixture.matchweek}
              </div>
            )}

            {/* Broadcasters */}
            <div className="broadcaster-info">
              {fixture.blackout?.is_blackout ? (
                <div className="blackout">
                  <span className="blackout-text" style={{ color: '#dc2626', fontWeight: '600' }}>
                    📺 Blackout
                  </span>
                  {fixture.blackout.reason && (
                    <div className="blackout-reason" style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                      {fixture.blackout.reason}
                    </div>
                  )}
                </div>
              ) : fixture.providers_uk.length > 0 ? (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#059669' }}>📺 Available on:</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {fixture.providers_uk.map((provider) => {
                      const link = getBroadcasterLink(provider.name, provider.href);
                      return link ? (
                        <a
                          key={provider.id}
                          href={link}
                          target="_blank"
                          rel="noreferrer noopener"
                          {...withAffiliateAriaLabel(provider.name)}
                          className="provider"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}
                        >
                          {provider.name} →
                        </a>
                      ) : (
                        <span
                          key={provider.id}
                          className="provider"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: 'var(--color-muted)',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}
                        >
                          {provider.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="tbd">
                  <span className="tbd-text" style={{ color: '#d97706', fontWeight: '600' }}>
                    📺 TBC - Broadcaster to be confirmed
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* See More Section */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151'
            }}>
              See more:
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* Home Team Button */}
              <Link
                to={`/clubs/${fixture.home.slug || fixture.home.name.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🏟️ {fixture.home.name}
              </Link>

              {/* Away Team Button */}
              <Link
                to={`/clubs/${fixture.away.slug || fixture.away.name.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🏟️ {fixture.away.name}
              </Link>

              {/* Competition Button */}
              {fixture.competition && (
                <Link
                  to={`/competitions/${fixture.competition.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🏆 {fixture.competition}
                </Link>
              )}
            </div>
          </div>
          {/* Footer disclosure */}
          <AffiliateDisclosure position="footer" />
        </div>
      </main>
    </div>
  );
};

export default MatchPage;
