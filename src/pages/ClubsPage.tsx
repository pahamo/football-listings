import React, { useState, useEffect } from 'react';
import { getTeams } from '../services/supabase';
import type { Team } from '../types';
import Header from '../components/Header';
import { ClubCard } from '../design-system';
import { generateClubsMeta, updateDocumentMeta } from '../utils/seo';

const ClubsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Premier League teams (exactly the 20 current EPL teams)
  const premierLeagueTeams = [
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
    'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
    'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
    'Nottingham Forest', 'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
  ];

  // Champions League teams (complete 2024-25 participant list)
  const championsLeagueTeams = [
    // English teams
    'Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa',
    // Spanish teams
    'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Girona',
    // German teams
    'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Stuttgart',
    // Italian teams
    'Inter Milan', 'AC Milan', 'Juventus', 'Atalanta', 'Bologna',
    // French teams
    'Paris Saint-Germain', 'AS Monaco', 'Lille', 'Brest',
    // Portuguese teams
    'Sporting CP', 'Benfica',
    // Dutch teams
    'PSV Eindhoven', 'Feyenoord',
    // Other teams
    'Celtic', 'Club Brugge', 'Shakhtar Donetsk', 'Red Star Belgrade',
    'Young Boys', 'Sparta Prague', 'Salzburg', 'Sturm Graz', 'Slovan Bratislava'
  ];

  // Filter teams by competition
  const eplTeams = teams.filter(team =>
    premierLeagueTeams.some(plTeam =>
      team.name.toLowerCase().includes(plTeam.toLowerCase().split(' ')[0].toLowerCase()) ||
      plTeam.toLowerCase().includes(team.name.toLowerCase())
    )
  );

  const uclTeams = teams.filter(team =>
    championsLeagueTeams.some(clTeam =>
      team.name.toLowerCase().includes(clTeam.toLowerCase().split(' ')[0].toLowerCase()) ||
      clTeam.toLowerCase().includes(team.name.toLowerCase())
    )
  );

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await getTeams();
      setTeams(teamsData);
      
      // Update SEO meta tags for clubs page
      const meta = generateClubsMeta();
      updateDocumentMeta(meta);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="clubs-page">
        <Header />
        <main>
          <div className="wrap">
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Clubs</h1>
            <div className="loading">Loading teams...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clubs-page">
        <Header />
        <main>
          <div className="wrap">
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Clubs</h1>
            <div className="error">{error}</div>
            <button onClick={loadTeams}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="clubs-page">
      <Header />
      
      <main>
        <div className="wrap">
          <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Clubs</h1>
          
          {/* Premier League Section */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#1f2937',
              borderBottom: '2px solid #6366f1',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚽ Premier League
            </h2>
            
            <div style={{
              background: '#f8fafc',
              padding: '12px 16px',
              margin: '0 0 16px 0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {eplTeams.length} of 20 Premier League clubs
            </div>
            
            <div 
              className="clubs-grid-compact"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '12px', 
                marginTop: '16px' 
              }}
            >
              {eplTeams.map(team => (
                <ClubCard 
                  key={team.id}
                  team={team}
                  variant="compact"
                />
              ))}
          </div>
          </section>

          {/* Champions League Section */}
          <section>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#1f2937',
              borderBottom: '2px solid #0ea5e9',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏆 UEFA Champions League
            </h2>
            
            <div style={{
              background: '#e0f2fe',
              padding: '12px 16px',
              margin: '0 0 16px 0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#0369a1',
              fontWeight: '500'
            }}>
              {uclTeams.length} Champions League clubs available
            </div>
            
            <div 
              className="clubs-grid-compact"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '12px', 
                marginTop: '16px' 
              }}
            >
              {uclTeams.map(team => (
                <ClubCard 
                  key={`ucl-${team.id}`}
                  team={team}
                  variant="ucl"
                  showBadge={true}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

    </div>
  );
};

export default ClubsPage;